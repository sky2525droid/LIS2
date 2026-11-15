import React, { useState, useMemo } from 'react';
import { TestOrder, LabSettings } from '../types';
import FinancialPrintModal from './FinancialPrintModal';

interface FinancialReportProps {
    orders: TestOrder[];
    updateOrderPayment?: (orderId: number, amount: number) => void;
    labSettings: LabSettings;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ orders, updateOrderPayment, labSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; orderId: number | null; amount: string }>({
        isOpen: false,
        orderId: null,
        amount: ''
    });

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return orders.filter(order => {
            let dateMatch = true;
            if (dateFilter === 'today') dateMatch = order.orderDate === todayStr;
            else if (dateFilter === 'week') {
                const orderDate = new Date(order.orderDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
                dateMatch = diffDays <= 7;
            } else if (dateFilter === 'month') {
                const orderDate = new Date(order.orderDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
                dateMatch = diffDays <= 30;
            }

            const searchMatch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase());
            
            return dateMatch && searchMatch;
        });
    }, [orders, dateFilter, searchTerm]);

    const patientStats = useMemo(() => {
        const stats: Record<number, { id: number, name: string, paid: number, total: number, discount: number, remaining: number, orderCount: number }> = {};
        
        filteredOrders.forEach(order => {
            if (!stats[order.patientId]) {
                stats[order.patientId] = { id: order.patientId, name: order.patientName, paid: 0, total: 0, discount: 0, remaining: 0, orderCount: 0 };
            }
            stats[order.patientId].paid += order.paidAmount || 0;
            stats[order.patientId].total += order.totalPrice || 0;
            stats[order.patientId].discount += order.discount || 0;
            stats[order.patientId].remaining += (order.totalPrice || 0) - (order.discount || 0) - (order.paidAmount || 0);
            stats[order.patientId].orderCount += 1;
        });
        
        return Object.values(stats).sort((a, b) => b.remaining - a.remaining);
    }, [filteredOrders]);

    const totals = useMemo(() => {
        return {
            paid: patientStats.reduce((sum, p) => sum + p.paid, 0),
            discount: patientStats.reduce((sum, p) => sum + p.discount, 0),
            remaining: patientStats.reduce((sum, p) => sum + p.remaining, 0),
            total: patientStats.reduce((sum, p) => sum + p.total, 0)
        };
    }, [patientStats]);

    const selectedPatientOrders = useMemo(() => {
        if (selectedPatientId === null) return [];
        return orders.filter(o => o.patientId === selectedPatientId).sort((a, b) => b.id - a.id);
    }, [orders, selectedPatientId]);

    const handlePaymentSubmit = () => {
        if (paymentModal.orderId && paymentModal.amount && updateOrderPayment) {
            updateOrderPayment(paymentModal.orderId, parseFloat(paymentModal.amount));
            setPaymentModal({ isOpen: false, orderId: null, amount: '' });
        }
    };

    const handlePrint = () => {
        setIsPrintModalOpen(true);
    };

    const periodLabel = dateFilter === 'all' ? 'كامل السجل' : dateFilter === 'today' ? 'اليوم' : dateFilter === 'week' ? 'آخر 7 أيام' : 'آخر 30 يوم';

    return (
        <div className="space-y-6 print:p-0">
            {isPrintModalOpen && (
                <FinancialPrintModal 
                    stats={patientStats} 
                    totals={totals} 
                    orders={filteredOrders}
                    onClose={() => setIsPrintModalOpen(false)} 
                    labSettings={labSettings}
                    period={periodLabel}
                />
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-teal-100 border-l-4 border-l-teal-500">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي الإيرادات المحصلة</p>
                    <h4 className="text-2xl font-black text-teal-600">{totals.paid.toLocaleString()} <span className="text-[10px] font-bold opacity-70">ل.س</span></h4>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-red-100 border-l-4 border-l-red-400">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي الحسومات</p>
                    <h4 className="text-2xl font-black text-red-400">{totals.discount.toLocaleString()} <span className="text-[10px] font-bold opacity-70">ل.س</span></h4>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">إجمالي المبالغ المتبقية</p>
                    <h4 className="text-2xl font-black text-red-500">{totals.remaining.toLocaleString()} <span className="text-[10px] font-bold opacity-70">ل.س</span></h4>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-gray-500">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">القيمة الإجمالية للفواتير</p>
                    <h4 className="text-2xl font-black text-gray-800">{totals.total.toLocaleString()} <span className="text-[10px] font-bold opacity-70">ل.س</span></h4>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="بحث عن مريض..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-bold"
                        />
                        <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <div className="flex bg-gray-50 p-1 rounded-2xl">
                        {(['all', 'today', 'week', 'month'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${
                                    dateFilter === f ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {f === 'all' ? 'الكل' : f === 'today' ? 'اليوم' : f === 'week' ? 'الأسبوع' : 'الشهر'}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handlePrint}
                    className="px-6 py-2 bg-gray-800 text-white rounded-xl text-xs font-black hover:bg-gray-900 transition flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    طباعة التقرير
                </button>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border-0 print:shadow-none no-print">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-800">تفاصيل التحصيل حسب المريض</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase no-print">إجمالي المرضى: {patientStats.length}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase">اسم المريض</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-center">التحصيل (المدفوع)</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-center">الحسم</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-center">المبلغ المتبقي</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-center">إجمالي الفاتورة</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-center">الحالة</th>
                                <th className="p-4 font-black text-gray-400 text-[10px] uppercase text-left pl-8 no-print">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {patientStats.length > 0 ? patientStats.map((p) => (
                                <React.Fragment key={p.id}>
                                    <tr className={`hover:bg-gray-50/50 transition-colors group ${selectedPatientId === p.id ? 'bg-teal-50/30' : ''}`}>
                                        <td className="p-4">
                                            <div className="font-black text-gray-800 text-sm">{p.name}</div>
                                            <div className="text-[9px] text-gray-400 font-bold">عدد الطلبات: {p.orderCount}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-teal-600 font-black text-sm">{p.paid.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-red-400 font-black text-sm">{p.discount.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-black text-sm ${p.remaining > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {p.remaining.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-gray-600 font-bold text-sm">{p.total.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-[9px] font-black rounded-full border ${
                                                p.remaining === 0 ? 'bg-green-50 text-green-700 border-green-100' : 
                                                p.paid > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {p.remaining === 0 ? 'خالص' : p.paid > 0 ? 'جزئي' : 'غير مدفوع'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-left pl-8 no-print">
                                            <button 
                                                onClick={() => setSelectedPatientId(selectedPatientId === p.id ? null : p.id)}
                                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                                    selectedPatientId === p.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {selectedPatientId === p.id ? 'إغلاق التفاصيل' : 'عرض التفاصيل'}
                                            </button>
                                        </td>
                                    </tr>
                                    {selectedPatientId === p.id && (
                                        <tr className="bg-gray-50/30 no-print">
                                            <td colSpan={6} className="p-6">
                                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                                    <table className="w-full text-right text-xs">
                                                        <thead>
                                                            <tr className="bg-gray-50 text-gray-400 font-black">
                                                                <th className="p-3">رقم الطلب</th>
                                                                <th className="p-3">الفحص</th>
                                                                <th className="p-3 text-center">التاريخ</th>
                                                                <th className="p-3 text-center">السعر</th>
                                                                <th className="p-3 text-center">الحسم</th>
                                                                <th className="p-3 text-center">المدفوع</th>
                                                                <th className="p-3 text-center">المتبقي</th>
                                                                <th className="p-3 text-left pl-6">إجراء</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {selectedPatientOrders.map(order => (
                                                                <tr key={order.id} className="hover:bg-gray-50/50">
                                                                    <td className="p-3 font-bold">#{order.id}</td>
                                                                    <td className="p-3 font-black text-gray-700">{order.testName}</td>
                                                                    <td className="p-3 text-center font-bold text-gray-400">{order.orderDate}</td>
                                                                    <td className="p-3 text-center font-black">{order.totalPrice.toLocaleString()}</td>
                                                                    <td className="p-3 text-center font-black text-red-400">{(order.discount || 0).toLocaleString()}</td>
                                                                    <td className="p-3 text-center font-black text-teal-600">{order.paidAmount.toLocaleString()}</td>
                                                                    <td className="p-3 text-center font-black text-red-500">{(order.totalPrice - (order.discount || 0) - order.paidAmount).toLocaleString()}</td>
                                                                    <td className="p-3 text-left pl-6">
                                                                        {order.paidAmount < (order.totalPrice - (order.discount || 0)) && (
                                                                            <button 
                                                                                onClick={() => setPaymentModal({ isOpen: true, orderId: order.id, amount: (order.totalPrice - (order.discount || 0) - order.paidAmount).toString() })}
                                                                                className="px-3 py-1 bg-teal-600 text-white rounded-lg font-black text-[9px] hover:bg-teal-700 transition"
                                                                            >
                                                                                دفع
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">لا توجد بيانات مالية للعرض</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-teal-600 text-white">
                            <h3 className="text-lg font-black">تسجيل دفعة مالية</h3>
                            <button onClick={() => setPaymentModal({ isOpen: false, orderId: null, amount: '' })} className="text-white/80 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">المبلغ المراد دفعه (ل.س)</label>
                                <input
                                    type="number"
                                    value={paymentModal.amount}
                                    onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-black focus:outline-none focus:ring-4 focus:ring-teal-500/10 text-center"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                            <button 
                                onClick={handlePaymentSubmit}
                                className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition active:scale-[0.98]"
                            >
                                تأكيد الدفع
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:border-0 { border: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                }
            `}} />
        </div>
    );
};

export default FinancialReport;
