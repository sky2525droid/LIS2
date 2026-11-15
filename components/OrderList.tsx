import React, { useState, useMemo, useEffect } from 'react';
import { TestOrder, TestStatus, LabSettings, PaymentStatus, TestCategory } from '../types';
import ViewSwitcher from './ViewSwitcher';

const PaymentModal: React.FC<{
    group: TestOrder[];
    onClose: () => void;
    updateOrderPayment: (orderId: number, amount: number) => void;
}> = ({ group, onClose, updateOrderPayment }) => {
    const totalGroupPrice = group.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalGroupDiscount = group.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalGroupFinalPrice = totalGroupPrice - totalGroupDiscount;
    const totalGroupPaid = group.reduce((sum, o) => sum + o.paidAmount, 0);
    const remainingAmount = Math.max(0, totalGroupFinalPrice - totalGroupPaid);
    const [paymentAmount, setPaymentAmount] = useState<number>(remainingAmount);

    const handlePayment = () => {
        if (paymentAmount <= 0) return;
        
        // Distribute payment across orders in the group that are not fully paid
        let amountToDistribute = paymentAmount;
        group.forEach(order => {
            const orderFinalPrice = order.totalPrice - (order.discount || 0);
            const orderRemaining = orderFinalPrice - order.paidAmount;
            if (orderRemaining > 0 && amountToDistribute > 0) {
                const paymentForThisOrder = Math.min(orderRemaining, amountToDistribute);
                updateOrderPayment(order.id, paymentForThisOrder);
                amountToDistribute -= paymentForThisOrder;
            }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4 animate-bg-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-enter">
                <div className="bg-teal-600 p-6 text-white text-center">
                    <h2 className="text-xl font-bold">تسجيل دفعة مالية</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-gray-500">
                            <span>إجمالي المبلغ:</span>
                            <span>{totalGroupPrice.toLocaleString()} ل.س</span>
                        </div>
                        {totalGroupDiscount > 0 && (
                            <div className="flex justify-between text-sm font-bold text-red-500">
                                <span>إجمالي الحسم:</span>
                                <span>-{totalGroupDiscount.toLocaleString()} ل.س</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-teal-600">
                            <span>الصافي المطلوب:</span>
                            <span>{totalGroupFinalPrice.toLocaleString()} ل.س</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-teal-600">
                            <span>المدفوع سابقاً:</span>
                            <span>{totalGroupPaid.toLocaleString()} ل.س</span>
                        </div>
                        <div className="flex justify-between text-lg font-black text-red-600 pt-2 border-t border-gray-100">
                            <span>المتبقي:</span>
                            <span>{remainingAmount.toLocaleString()} ل.س</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ المراد دفعه الآن</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(Number(e.target.value))}
                                className="w-full p-3 pr-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 bg-gray-50 font-bold text-teal-700"
                                max={remainingAmount}
                                min={0}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-400">ل.س</span>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-sm">إلغاء</button>
                        <button 
                            onClick={handlePayment}
                            className="flex-[2] px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg text-sm active:scale-95"
                            disabled={paymentAmount <= 0}
                        >
                            تأكيد الدفع
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ReportPrintModal: React.FC<{
    patientName: string;
    orders: TestOrder[];
    allPatientOrders: TestOrder[]; // All orders for this patient
    onClose: () => void;
    labSettings: LabSettings;
}> = ({ patientName, orders, allPatientOrders, onClose, labSettings }) => {
    const todayStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' });
    const approvedOrders = orders.filter(o => o.status === TestStatus.Approved || o.status === TestStatus.Delivered);
    const [isGenerating, setIsGenerating] = useState(false);

    const previousResultsMap = useMemo(() => {
        if (!labSettings.showPreviousResults) return new Map();

        const currentOrderIds = new Set(orders.map(o => o.id));
        
        const historicalOrders = allPatientOrders.filter(
            o => !currentOrderIds.has(o.id) && (o.status === TestStatus.Approved || o.status === TestStatus.Delivered) && o.result
        );

        const groupedByTest = historicalOrders.reduce((acc, order) => {
            if (!acc[order.testName]) {
                acc[order.testName] = [];
            }
            acc[order.testName].push(order);
            return acc;
        }, {} as Record<string, TestOrder[]>);

        const latestResults = new Map<string, { result: string | null; orderDate: string }>();
        for (const testName in groupedByTest) {
            const testOrders = groupedByTest[testName];
            if (testOrders.length > 0) {
                testOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                latestResults.set(testName, { result: testOrders[0].result, orderDate: testOrders[0].orderDate });
            }
        }
        return latestResults;
    }, [labSettings.showPreviousResults, allPatientOrders, orders]);


    useEffect(() => {
        const originalTitle = document.title;
        document.title = `تقرير_مخبري_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        return () => { document.title = originalTitle; };
    }, [patientName]);

    const handleSaveAsPDF = () => {
        const element = document.getElementById('print-area-content');
        if (!element) return;
        setIsGenerating(true);
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `تقرير_مخبري_${patientName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: false, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        };
        // @ts-ignore
        const h2p = window.html2pdf;
        if (h2p) {
            h2p().set(opt).from(element).save().then(() => setIsGenerating(false)).catch(() => setIsGenerating(false));
        } else {
            window.print();
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] p-4 animate-bg-fade-in print:p-0 print:bg-white">
            <style>{`
                #print-area-content {
                    font-family: ${labSettings.fontFamily} !important;
                }
                .arabic-text { direction: rtl !important; unicode-bidi: isolate !important; }
                .english-text { direction: ltr !important; display: inline-block !important; }
            `}</style>
            <div id="print-area" className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
                <div id="print-area-content" className="flex-1 overflow-y-auto p-12 md:p-16 print:overflow-visible print:p-10 bg-white arabic-text flex flex-col h-full">
                    <div className="flex justify-between items-start border-b-4 pb-6 mb-6" style={{ borderBottomColor: labSettings.headerColor, height: '110px', fontSize: '15px', lineHeight: '13px' }}>
                        <div className="flex gap-6 items-start">
                            {labSettings.logoUrl && (
                                <img src={labSettings.logoUrl} alt="Logo" className="object-contain" style={{ width: labSettings.logoSize, height: labSettings.logoSize }} />
                            )}
                            <div>
                                <h2 className="font-black mb-2" style={{ color: labSettings.headerColor, fontSize: '24px' }}>
                                    {labSettings.labName}
                                </h2>
                                <div className="text-gray-500 font-bold space-y-1 text-sm">
                                    <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>{labSettings.address}</p>
                                    <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>هاتف: {labSettings.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-left print:hidden">
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                        </div>
                    </div>
                    
                    <div style={{ height: '83px', width: '760px', lineHeight: '15px', fontFamily: 'Arial', fontWeight: 'bold', fontSize: '16px' }} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 print:bg-white print:border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-right">
                            {/* Patient Info (Right) */}
                            <div className="w-full md:w-auto flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold text-xs">المريض:</span>
                                    <span className="text-gray-900 font-black text-xl" style={{ fontSize: `${labSettings.patientNameFontSize}rem` }}>{patientName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold text-xs">تاريخ التقرير:</span>
                                    <span className="text-gray-900 font-bold text-sm">{todayStr}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                            {/* File Number (Center) */}
                            <div className="w-full md:w-auto flex flex-col items-center justify-center gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold text-xs">رقم الملف:</span>
                                    <span className="text-gray-400 font-black text-xl font-mono">#{String(orders[0].patientId).padStart(5, '0').slice(-5)}</span>
                                </div>
                                {orders[0].referringDoctor && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold text-[10px]">الطبيب المحيل:</span>
                                        <span className="text-teal-600 font-black text-xs">{orders[0].referringDoctor}</span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                            {/* Sample Date (Left) */}
                            <div className="w-full md:w-auto flex items-center justify-end gap-3">
                                <span className="text-gray-400 font-bold text-xs">تاريخ السحب:</span>
                                <span className="text-gray-900 font-black text-lg dir-ltr" dir="ltr">{orders[0].orderDate}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <table className="w-full text-right border-collapse table-fixed break-inside-auto">
                            <thead>
                                <tr className="border-b-2" style={{ borderBottomColor: labSettings.headerColor }}>
                                    <th className="py-4 px-2 font-black text-sm whitespace-nowrap" style={{ color: labSettings.headerColor, width: labSettings.showPreviousResults ? '35%' : '50%', lineHeight: '15px', fontWeight: 'bold' }}>TEST</th>
                                    <th className="py-4 px-2 font-black text-sm text-center whitespace-nowrap" style={{ color: labSettings.headerColor, width: '20%' }}>Result</th>
                                    {labSettings.showPreviousResults && (
                                        <th className="py-4 px-2 font-black text-sm text-center whitespace-nowrap" style={{ color: labSettings.headerColor, width: '25%' }}>Last Result (Date)</th>
                                    )}
                                    <th className="py-4 px-2 font-black text-sm text-center whitespace-nowrap" style={{ color: labSettings.headerColor, width: labSettings.showPreviousResults ? '20%' : '30%' }}>Normal Range</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {approvedOrders.map(o => {
                                    if (o.isProfile && o.subTests) {
                                        let resultsObj: Record<string, string> = {};
                                        try { resultsObj = o.result ? JSON.parse(o.result) : {}; } catch(e) {}
                                        
                                        return (
                                            <React.Fragment key={o.id}>
                                                <tr className="bg-gray-50/80">
                                                    <td colSpan={labSettings.showPreviousResults ? 4 : 3} className="py-2.5 px-3 align-middle break-words font-black text-gray-900 text-[16px] english-text">
                                                        {o.testName}
                                                        {o.notes && <div className="text-[11px] text-gray-500 font-bold mt-0.5">{o.notes}</div>}
                                                    </td>
                                                </tr>
                                                {o.subTests.map((subTest, inlineIdx) => {
                                                    return (
                                                        <tr key={`${o.id}-${inlineIdx}`}>
                                                            <td style={{ height: '35px' }} className="py-2 px-4 align-middle break-words rtl:pr-8 ltr:pl-8">
                                                                <div className="font-bold text-gray-800 text-[15px] english-text inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>{subTest.name}</div>
                                                            </td>
                                                            <td className="py-2 px-2 font-black text-center align-middle break-words" style={{ color: labSettings.headerColor, fontSize: `${labSettings.resultsFontSize}rem` }}>
                                                                <span className="english-text" style={{ fontSize: '15px' }}>{resultsObj[subTest.name] || '-'}</span>
                                                            </td>
                                                            {labSettings.showPreviousResults && (
                                                                <td className="py-2 px-2 text-center align-middle break-words">
                                                                    <span className="text-gray-400">-</span>
                                                                </td>
                                                            )}
                                                            <td style={{ height: '30px' }} className="py-2 px-2 font-bold text-gray-400 text-center text-[13px] align-middle break-words">
                                                                <span className="english-text">{subTest.normalRange}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    }

                                    const prevResult = previousResultsMap.get(o.testName);
                                    return (
                                        <tr key={o.id}>
                                            <td style={{ height: '35px' }} className="py-2 px-2 align-middle break-words">
                                                <div className="font-bold text-gray-800 text-[16px] english-text">{o.testName}</div>
                                                {o.notes && <div className="text-[11px] text-gray-500 font-bold mt-0.5">{o.notes}</div>}
                                            </td>
                                            <td className="py-2 px-2 font-black text-center align-middle break-words" style={{ color: labSettings.headerColor, fontSize: `${labSettings.resultsFontSize}rem` }}>
                                                <span className="english-text" style={{ fontSize: '16px', lineHeight: '20px' }}>{o.result}</span>
                                            </td>
                                            {labSettings.showPreviousResults && (
                                                <td className="py-2 px-2 text-center align-middle break-words">
                                                    {prevResult ? (
                                                        <div>
                                                            <span className="font-bold text-sm text-gray-700 english-text">{prevResult.result}</span>
                                                            <span className="block text-[10px] text-gray-400 font-mono english-text">({prevResult.orderDate})</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td style={{ height: '30px' }} className="py-2 px-2 font-bold text-gray-400 text-center text-base align-middle break-words">
                                                <span className="english-text">{o.normalRange}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-end mb-6 px-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">الفني المختص</p>
                                <p className="text-sm font-black text-gray-800">{labSettings.technician}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">مراجعة الجودة</p>
                                <p className="text-sm font-black text-gray-800">{labSettings.qcDoctor}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">مدير المختبر</p>
                                <p className="text-sm font-black text-gray-800">د. {labSettings.labDirector}</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 py-2 rounded-lg text-center border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-600">
                                {labSettings.labName} - {labSettings.address} - هاتف: {labSettings.phone}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white border-t print:hidden flex flex-wrap justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-4 bg-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-200">إغلاق</button>
                    <button onClick={handleSaveAsPDF} disabled={isGenerating} className="px-6 py-4 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black hover:bg-red-100 flex items-center gap-2 disabled:opacity-50">{isGenerating ? <svg className="animate-spin h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}{isGenerating ? 'جاري الإنشاء...' : 'حفظ PDF'}</button>
                    <button onClick={() => window.print()} className="flex-1 min-w-[200px] px-8 py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl flex items-center justify-center gap-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>طباعة</button>
                </div>
            </div>
        </div>
    );
};

const OrderList: React.FC<{
    allOrders: TestOrder[];
    openOrderModal: () => void;
    updateOrderStatus?: (orderId: number, status: TestStatus, result: string | null) => void;
    updateOrderPayment: (orderId: number, amount: number) => void;
    labSettings: LabSettings;
    testData: TestCategory[];
}> = ({ allOrders, openOrderModal, updateOrderStatus, updateOrderPayment, labSettings, testData }) => {
    const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [printModalData, setPrintModalData] = useState<{ patientName: string; orders: TestOrder[], allPatientOrders: TestOrder[] } | null>(null);
    const [paymentModalGroup, setPaymentModalGroup] = useState<TestOrder[] | null>(null);

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        return allOrders.filter(o => {
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesSearch = o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 o.testName.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesTime = true;
            const orderDateStr = o.orderDate.split('T')[0];
            if (period === 'today') matchesTime = orderDateStr === todayStr;
            else if (period !== 'all') {
                const orderDateObj = new Date(o.orderDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24));
                if (period === 'week') matchesTime = diffDays <= 7;
                else if (period === 'month') matchesTime = diffDays <= 30;
            }
            return matchesStatus && matchesSearch && matchesTime;
        });
    }, [allOrders, statusFilter, searchTerm, period]);

    const groupedOrders = useMemo(() => {
        const groups: Record<string, TestOrder[]> = {};
        filteredOrders.forEach(o => {
            const datePart = o.orderDate.split('T')[0];
            const key = `${o.patientId}-${datePart}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(o);
        });
        return Object.values(groups);
    }, [filteredOrders]);

    const getStatusStyles = (status: TestStatus) => {
        switch (status) {
            case TestStatus.Delivered: return 'bg-teal-100 text-teal-700 border-teal-200';
            case TestStatus.Approved: return 'bg-green-100 text-green-700 border-green-200';
            case TestStatus.Completed: return 'bg-blue-100 text-blue-700 border-blue-200';
            case TestStatus.SampleCollected: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case TestStatus.Pending: return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const getPaymentStatusStyles = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.Paid: return 'bg-green-100 text-green-700 border-green-200';
            case PaymentStatus.PartiallyPaid: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case PaymentStatus.Unpaid: return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleMarkAsDelivered = (group: TestOrder[]) => {
        if (updateOrderStatus) {
            group.forEach(o => {
                if (o.status === TestStatus.Approved) {
                    updateOrderStatus(o.id, TestStatus.Delivered, o.result);
                }
            });
        }
    };

    const handleOpenPrintModal = (group: TestOrder[]) => {
        const patientId = group[0].patientId;
        const allPatientOrders = allOrders.filter(o => o.patientId === patientId);
        setPrintModalData({
            patientName: group[0].patientName,
            orders: group,
            allPatientOrders
        });
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            {printModalData && <ReportPrintModal {...printModalData} onClose={() => setPrintModalData(null)} labSettings={labSettings} />}
            {paymentModalGroup && <PaymentModal group={paymentModalGroup} onClose={() => setPaymentModalGroup(null)} updateOrderPayment={updateOrderPayment} />}
            
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <h3 className="text-xl font-black text-gray-800">إدارة الطلبات والتقارير</h3>
                        <p className="text-gray-400 font-medium text-[11px] mt-0.5">عرض ومتابعة الفحوصات، وطباعة النتائج المعتمدة.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['today', 'week', 'month', 'all'] as const).map((p) => (
                                <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${period === p ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                                    {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                                </button>
                            ))}
                        </div>
                        <button onClick={openOrderModal} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-black hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 flex items-center gap-1.5 active:scale-95 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                            طلب فحص جديد
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
                        <input type="text" placeholder="بحث باسم المريض..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pr-9 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 font-bold text-xs" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 font-bold text-[11px] text-gray-600 min-w-[120px]">
                        <option value="all">كل الحالات</option>
                        {Object.values(TestStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>

                {groupedOrders.length === 0 ? (
                    <div className="py-24 text-center text-gray-400 font-black">لا توجد طلبات لعرضها في هذه الفترة</div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th style={{ width: '175px' }} className="p-4 font-black text-gray-500 uppercase text-[12px] tracking-widest">المريض</th>
                                    <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest">الطبيب المحيل</th>
                                    <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest">الفحوصات المطلوبة</th>
                                    <th style={{ width: '160px' }} className="p-4 font-black text-gray-500 uppercase text-[13px] tracking-widest text-center">تاريخ الطلب</th>
                                    <th style={{ width: '118.172px' }} className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الحالة الإجمالية</th>
                                    <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الحالة المالية</th>
                                    <th style={{ width: '259.641px' }} className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-left pl-6">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {groupedOrders.map(group => {
                                    const hasApproved = group.some(o => o.status === TestStatus.Approved || o.status === TestStatus.Delivered);
                                    const allDelivered = group.every(o => o.status === TestStatus.Delivered);
                                    const allApproved = group.every(o => o.status === TestStatus.Approved || o.status === TestStatus.Delivered);
                                    
                                    return (
                                        <tr key={`${group[0].patientId}-${group[0].orderDate}`} className="hover:bg-teal-50/20 transition-colors group">
                                            <td style={{ width: '175px', height: '57px' }} className="p-4">
                                                <div style={{ width: '175px' }} className="font-black text-gray-800 text-[14px]">{group[0].patientName}</div>
                                                <div className="text-[14px] text-gray-400 font-bold tracking-wider">ملف: #{String(group[0].patientId).padStart(5, '0').slice(-5)}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-teal-600 text-[14px]">{group[0].referringDoctor || '---'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(() => {
                                                        const items: string[] = [];
                                                        let remainingOrders = [...group];
                                                        
                                                        // Group patterns: check each category for full groups
                                                        testData.forEach(cat => {
                                                            cat.groups.forEach(testGroup => {
                                                                const groupTestNames = testGroup.tests.map(t => t.abbreviation || t.name);
                                                                const matchingOrders = remainingOrders.filter(o => groupTestNames.includes(o.testName));
                                                                
                                                                // If all tests in a predefined group are present, show group name
                                                                if (matchingOrders.length > 0 && matchingOrders.length === groupTestNames.length) {
                                                                    items.push(testGroup.name);
                                                                    remainingOrders = remainingOrders.filter(o => !groupTestNames.includes(o.testName));
                                                                }
                                                            });
                                                        });

                                                        // Add remaining individual tests
                                                        remainingOrders.forEach(o => {
                                                            items.push(o.testName);
                                                        });

                                                        return items.map((name, idx) => (
                                                            <span key={idx} className="text-gray-700 font-normal bg-gray-100 px-2.5 py-1 rounded-lg text-[12px] leading-[19px] whitespace-nowrap border border-gray-200">{name}</span>
                                                        ));
                                                    })()}
                                                </div>
                                            </td>
                                            <td style={{ width: '160px' }} className="p-4 text-center text-gray-500 font-bold text-[13px]">{group[0].orderDate}</td>
                                            <td className="p-4 text-center">
                                                 <span style={{ fontWeight: 'bold', lineHeight: '13px', width: '101px', display: 'inline-block' }} className={`px-4 py-1 text-[10px] font-black rounded-full border shadow-sm ${getStatusStyles(allDelivered ? TestStatus.Delivered : allApproved ? TestStatus.Approved : group[0].status)}`}>
                                                    {allDelivered ? 'تم التسليم للمريض' : allApproved ? 'بانتظار التسليم' : 'قيد المعالجة'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {(() => {
                                                    const totalPrice = group.reduce((sum, o) => sum + o.totalPrice, 0);
                                                    const discount = group.reduce((sum, o) => sum + (o.discount || 0), 0);
                                                    const finalPrice = totalPrice - discount;
                                                    const paidAmount = group.reduce((sum, o) => sum + o.paidAmount, 0);
                                                    let status = PaymentStatus.Unpaid;
                                                    if (paidAmount >= finalPrice) status = PaymentStatus.Paid;
                                                    else if (paidAmount > 0) status = PaymentStatus.PartiallyPaid;
                                                    
                                                    return (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`px-3 py-1 text-[9px] font-black rounded-full border ${getPaymentStatusStyles(status)}`}>
                                                                {status}
                                                            </span>
                                                            {status !== PaymentStatus.Paid && (
                                                                <span className="text-[9px] font-bold text-red-500">متبقي: {(finalPrice - paidAmount).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td style={{ width: '259.641px', fontSize: '14px' }} className="p-4 text-left pl-6">
                                                <div className="flex gap-2 justify-end items-center opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {(() => {
                                                        const totalPrice = group.reduce((sum, o) => sum + o.totalPrice, 0);
                                                        const discount = group.reduce((sum, o) => sum + (o.discount || 0), 0);
                                                        const finalPrice = totalPrice - discount;
                                                        const paidAmount = group.reduce((sum, o) => sum + o.paidAmount, 0);
                                                        if (paidAmount < finalPrice) {
                                                            return (
                                                                <button 
                                                                    onClick={() => setPaymentModalGroup(group)}
                                                                    style={{ lineHeight: '13px', width: '118px', justifyContent: 'center' }}
                                                                    className="px-3 py-2 bg-teal-50 text-teal-700 text-[10px] font-black rounded-xl hover:bg-teal-100 transition border border-teal-200 active:scale-95 flex items-center gap-1"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                                                    دفع المتبقي
                                                                </button>
                                                            );
                                                        }
                                                        return null;
                                                     })()}
                                                    {hasApproved && (
                                                        <button 
                                                            onClick={() => handleOpenPrintModal(group)}
                                                            className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md active:scale-95" 
                                                            title="طباعة التقرير الطبي"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                        </button>
                                                    )}
                                                    {allApproved && !allDelivered && (
                                                        <button 
                                                            onClick={() => handleMarkAsDelivered(group)} 
                                                            className="px-4 py-2 bg-teal-50 text-teal-700 text-[10px] font-black rounded-xl hover:bg-teal-100 transition border-2 border-teal-500/20 active:scale-95"
                                                        >
                                                            تأكيد التسليم
                                                        </button>
                                                    )}
                                                    {allDelivered && <span className="bg-teal-600 text-white px-3 py-1.5 rounded-xl font-black text-[10px] shadow-sm flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg> مُسلّم</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderList;