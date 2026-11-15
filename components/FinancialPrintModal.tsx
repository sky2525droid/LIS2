import React, { useState } from 'react';
import { TestOrder, LabSettings } from '../types';

interface FinancialPrintModalProps {
    stats: any[];
    totals: any;
    orders: TestOrder[];
    onClose: () => void;
    labSettings: LabSettings;
    period: string;
}

const FinancialPrintModal: React.FC<FinancialPrintModalProps> = ({ stats, totals, orders, onClose, labSettings, period }) => {
    const todayStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSaveAsPDF = () => {
        const element = document.getElementById('financial-print-content');
        if (!element) return;
        setIsGenerating(true);
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `تقرير_مالي_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: false, 
                scrollY: 0,
                letterRendering: true,
                allowTaint: true
            },
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
                #financial-print-content {
                    font-family: ${labSettings.fontFamily} !important;
                    letter-spacing: 0 !important;
                }
                #financial-print-content * {
                    letter-spacing: 0 !important;
                    word-spacing: 0 !important;
                }
                .arabic-text { 
                    direction: rtl !important; 
                    unicode-bidi: isolate !important; 
                    text-align: right !important;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-modal-enter overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
                <div id="financial-print-content" className="flex-1 overflow-y-auto p-12 md:p-16 print:overflow-visible print:p-10 bg-white arabic-text flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 pb-6 mb-8" style={{ borderBottomColor: labSettings.headerColor }}>
                        <div className="flex gap-6 items-start">
                            {labSettings.logoUrl && (
                                <img src={labSettings.logoUrl} alt="Logo" className="object-contain" style={{ width: labSettings.logoSize, height: labSettings.logoSize }} />
                            )}
                            <div>
                                <h2 className="font-black mb-2" style={{ color: labSettings.headerColor, fontSize: `${labSettings.labNameFontSize}rem` }}>
                                    {labSettings.labName}
                                </h2>
                                <div className="text-gray-500 font-bold space-y-1 text-sm">
                                    <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>{labSettings.address}</p>
                                    <p className="flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>هاتف: {labSettings.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl font-black text-gray-800 mb-2">تقرير التحصيل المالي</h3>
                            <p className="text-gray-400 font-bold text-sm">تاريخ التقرير: {todayStr}</p>
                            <p className="text-teal-600 font-black text-sm mt-1">الفترة: {period}</p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-10">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي المحصل</p>
                            <h4 className="text-xl font-black text-teal-600">{totals.paid.toLocaleString()} ل.س</h4>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي الحسم</p>
                            <h4 className="text-xl font-black text-red-400">{totals.discount.toLocaleString()} ل.س</h4>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي المتبقي</p>
                            <h4 className="text-xl font-black text-red-500">{totals.remaining.toLocaleString()} ل.س</h4>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">القيمة الإجمالية</p>
                            <h4 className="text-xl font-black text-gray-800">{totals.total.toLocaleString()} ل.س</h4>
                        </div>
                    </div>

                    {/* Patient Summary Table */}
                    <div className="mb-10">
                        <h4 className="text-lg font-black text-gray-800 mb-4 border-r-4 border-teal-500 pr-3">ملخص المرضى</h4>
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b-2" style={{ borderBottomColor: labSettings.headerColor }}>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase">اسم المريض</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">الطلبات</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">المدفوع</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">الحسم</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">المتبقي</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.map(p => (
                                    <tr key={p.id}>
                                        <td className="py-4 px-2 font-bold text-gray-800">{p.name}</td>
                                        <td className="py-4 px-2 text-center font-bold text-gray-500">{p.orderCount}</td>
                                        <td className="py-4 px-2 text-center font-black text-teal-600">{p.paid.toLocaleString()}</td>
                                        <td className="py-4 px-2 text-center font-black text-red-400">{p.discount.toLocaleString()}</td>
                                        <td className="py-4 px-2 text-center font-black text-red-500">{p.remaining.toLocaleString()}</td>
                                        <td className="py-4 px-2 text-center font-black text-gray-800">{p.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Detailed Orders Table */}
                    <div className="mb-10">
                        <h4 className="text-lg font-black text-gray-800 mb-4 border-r-4 border-teal-500 pr-3">تفاصيل الطلبات</h4>
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b-2" style={{ borderBottomColor: labSettings.headerColor }}>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase">رقم الطلب</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase">المريض</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase">الفحص</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">التاريخ</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">المدفوع</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">المتبقي</th>
                                    <th className="py-4 px-2 font-black text-xs text-gray-500 uppercase text-center">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="py-3 px-2 font-bold text-gray-500 text-xs">#{order.id}</td>
                                        <td className="py-3 px-2 font-bold text-gray-800 text-xs">{order.patientName}</td>
                                        <td className="py-3 px-2 font-black text-gray-700 text-xs">{order.testName}</td>
                                        <td className="py-3 px-2 text-center font-bold text-gray-400 text-[10px]">{order.orderDate}</td>
                                        <td className="py-3 px-2 text-center font-black text-teal-600 text-xs">{order.paidAmount.toLocaleString()}</td>
                                        <td className="py-3 px-2 text-center font-black text-red-500 text-xs">{(order.totalPrice - (order.discount || 0) - order.paidAmount).toLocaleString()}</td>
                                        <td className="py-3 px-2 text-center font-black text-gray-800 text-xs">{order.totalPrice.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-end mb-6 px-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">المحاسب المسؤول</p>
                                <div className="h-12 w-32 border-b border-dashed border-gray-300 mb-2"></div>
                                <p className="text-sm font-black text-gray-800">{labSettings.accountantName}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">ختم المختبر</p>
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-200">الختم الرسمي</div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">مدير المختبر</p>
                                <p className="text-sm font-black text-gray-800">د. {labSettings.labDirector}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white border-t no-print flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-200 transition-colors">إغلاق</button>
                    <button 
                        onClick={handleSaveAsPDF} 
                        disabled={isGenerating} 
                        className="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black hover:bg-red-100 flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        {isGenerating ? 'جاري الإنشاء...' : 'حفظ PDF'}
                    </button>
                    <button 
                        onClick={() => window.print()} 
                        className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl flex items-center gap-2 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinancialPrintModal;
