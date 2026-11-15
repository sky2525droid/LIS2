import React, { useState, useMemo } from 'react';
import { Page, TestOrder, TestStatus } from '../types';
import StatCard from './StatCard';
import { PatientIcon, PendingIcon, CompletedIcon, TestTubeIcon, MoneyIcon } from './icons/Icons';

interface DashboardProps {
    orders: TestOrder[];
    patientsCount: number;
    setCurrentPage?: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, patientsCount, setCurrentPage }) => {
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return orders.filter(order => {
            if (period === 'all') return true;
            if (period === 'today') return order.orderDate === todayStr;
            
            const orderDate = new Date(order.orderDate);
            const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (period === 'week') return diffDays <= 7;
            if (period === 'month') return diffDays <= 30;
            return true;
        });
    }, [orders, period]);

    const stats = useMemo(() => {
        return {
            awaitingSample: filteredOrders.filter(o => o.status === TestStatus.Pending).length,
            awaitingResults: filteredOrders.filter(o => o.status === TestStatus.SampleCollected).length,
            completed: filteredOrders.filter(o => o.status === TestStatus.Approved || o.status === TestStatus.Completed || o.status === TestStatus.Delivered).length,
            totalRevenue: filteredOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0),
            totalDiscount: filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0),
            totalRemaining: filteredOrders.reduce((sum, o) => sum + ((o.totalPrice || 0) - (o.discount || 0) - (o.paidAmount || 0)), 0)
        };
    }, [filteredOrders]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 sm:p-2.5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-800 px-2 mb-2 sm:mb-0">نظرة عامة على النشاط</h3>
                <div className="flex bg-gray-50 p-1 rounded-lg w-full sm:w-auto">
                    {(['today', 'week', 'month', 'all'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 sm:flex-none px-3 py-1 text-[9px] font-bold rounded-md transition-all ${
                                period === p ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-100/50'
                            }`}
                        >
                            {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="الفحوصات المنجزة" 
                    value={stats.completed.toString()} 
                    icon={<CompletedIcon />} 
                    color="green" 
                    onClick={() => setCurrentPage?.('qualityControl')}
                />
                <StatCard 
                    title="بانتظار النتائج" 
                    value={stats.awaitingResults.toString()} 
                    icon={<TestTubeIcon />} 
                    color="purple" 
                    onClick={() => setCurrentPage?.('results')}
                />
                <StatCard 
                    title="بانتظار السحب" 
                    value={stats.awaitingSample.toString()} 
                    icon={<PendingIcon />} 
                    color="yellow" 
                    onClick={() => setCurrentPage?.('sampleCollection')}
                />
                <StatCard 
                    title="إجمالي المرضى" 
                    value={patientsCount.toString()} 
                    icon={<PatientIcon />} 
                    color="blue" 
                    onClick={() => setCurrentPage?.('patients')}
                />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-800 mb-3">إجراءات سريعة</h3>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setCurrentPage?.('patients')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-700 rounded-xl font-bold text-xs hover:bg-teal-100 transition-all active:scale-95 border border-teal-100 shadow-sm"
                    >
                        <PatientIcon />
                        إضافة مريض جديد
                    </button>
                    <button 
                        onClick={() => setCurrentPage?.('orders')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 shadow-sm"
                    >
                        <TestTubeIcon />
                        طلب فحص جديد
                    </button>
                    <button 
                        onClick={() => setCurrentPage?.('financials')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all active:scale-95 border border-amber-100 shadow-sm"
                    >
                        <MoneyIcon />
                        التقرير المالي
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                    onClick={() => setCurrentPage?.('financials')}
                    className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-teal-500/20 text-white cursor-pointer hover:scale-[1.02] transition-transform"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-teal-100 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي الإيرادات المحصلة</p>
                            <h4 className="text-2xl font-black">{stats.totalRevenue.toLocaleString()} <span className="text-xs font-bold opacity-80">ل.س</span></h4>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>
                </div>
                <div 
                    onClick={() => setCurrentPage?.('financials')}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg shadow-amber-500/20 text-white cursor-pointer hover:scale-[1.02] transition-transform"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي الحسومات</p>
                            <h4 className="text-2xl font-black">{stats.totalDiscount.toLocaleString()} <span className="text-xs font-bold opacity-80">ل.س</span></h4>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                        </div>
                    </div>
                </div>
                <div 
                    onClick={() => setCurrentPage?.('financials')}
                    className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg shadow-red-500/20 text-white cursor-pointer hover:scale-[1.02] transition-transform"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-red-100 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي المبالغ المتبقية</p>
                            <h4 className="text-2xl font-black">{stats.totalRemaining.toLocaleString()} <span className="text-xs font-bold opacity-80">ل.س</span></h4>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-800">الطلبات الأخيرة ({period === 'all' ? 'الكل' : 'محدد'})</h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-black text-gray-400 text-xs uppercase tracking-widest">اسم المريض</th>
                                <th className="p-4 font-black text-gray-400 text-xs uppercase tracking-widest">اسم الفحص</th>
                                <th className="p-4 font-black text-gray-400 text-xs uppercase tracking-widest">التاريخ</th>
                                <th className="p-4 font-black text-gray-400 text-xs uppercase tracking-widest text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {filteredOrders.length > 0 ? filteredOrders.slice(0, 8).map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="p-5 text-gray-800 font-bold text-sm">{order.patientName}</td>
                                    <td className="p-5 text-gray-800">
                                        <span className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg font-bold text-xs text-gray-600">{order.testName}</span>
                                    </td>
                                    <td className="p-5 text-gray-500 font-bold text-xs dir-ltr text-right">{order.orderDate}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-full inline-block min-w-[90px] ${
                                            order.status === TestStatus.Approved || order.status === TestStatus.Delivered ? 'bg-green-100 text-green-700' : 
                                            order.status === TestStatus.Completed ? 'bg-blue-100 text-blue-700' :
                                            order.status === TestStatus.SampleCollected ? 'bg-purple-100 text-purple-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status === TestStatus.Approved ? 'معتمـدة' : 
                                             order.status === TestStatus.Delivered ? 'مسلّمة' :
                                             order.status === TestStatus.Completed ? 'مكتملة' :
                                             order.status === TestStatus.SampleCollected ? 'جاري الفحص' :
                                             'قيد الانتظار'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-400 font-bold">لا توجد طلبات في هذه الفترة</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;