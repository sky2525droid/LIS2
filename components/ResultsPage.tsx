
import React, { useState, useMemo } from 'react';
import { TestOrder, TestStatus } from '../types';
import ResultForm from './ResultForm';
import ViewSwitcher from './ViewSwitcher';

interface ResultsPageProps {
    orders: TestOrder[];
    updateOrderStatus: (orderId: number, status: TestStatus, result: string | null) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ orders, updateOrderStatus }) => {
    const [selectedPatientGroup, setSelectedPatientGroup] = useState<TestOrder[] | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

    // Filter relevant orders
    const relevantOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return orders.filter(o => {
            const isRelevantStatus = o.status === TestStatus.SampleCollected || o.status === TestStatus.Completed;
            if (!isRelevantStatus) return false;

            const matchesSearch = o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 o.testName.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesTime = true;
            if (period === 'today') matchesTime = o.orderDate === todayStr;
            else if (period !== 'all') {
                const orderDateObj = new Date(o.orderDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24));
                if (period === 'week') matchesTime = diffDays <= 7;
                else if (period === 'month') matchesTime = diffDays <= 30;
            }
            return matchesSearch && matchesTime;
        });
    }, [orders, searchTerm, period]);

    // Grouping logic: Group by patientId AND orderDate
    const groupedResults = useMemo(() => {
        const groups: Record<string, TestOrder[]> = {};
        relevantOrders.forEach(o => {
            const key = `${o.patientId}-${o.orderDate}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(o);
        });
        return Object.values(groups);
    }, [relevantOrders]);

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            {selectedPatientGroup && (
                <ResultForm 
                    orders={selectedPatientGroup} 
                    onClose={() => setSelectedPatientGroup(null)} 
                    updateOrderStatus={updateOrderStatus} 
                />
            )}
            
            <div className="border-b border-gray-100 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-lg font-black text-gray-800">وحدة إدخال النتائج</h3>
                    <p className="text-gray-400 font-bold text-[10px] mt-0.5">إدخال وتدقيق النتائج للعينات المسحوبة (مجمعة حسب المريض).</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {(['today', 'week', 'month', 'all'] as const).map((p) => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${period === p ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                                {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
                        <input type="text" placeholder="بحث باسم المريض..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48 p-1.5 pr-8 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 font-bold text-xs" />
                    </div>
                </div>
            </div>

            {groupedResults.length === 0 ? (
                <div className="text-center py-24 text-gray-400 font-bold">لا توجد عينات بانتظار إدخال النتائج</div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-50 shadow-sm">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-5 font-black text-gray-500 uppercase text-xs tracking-widest">المريض</th>
                                <th className="p-5 font-black text-gray-500 uppercase text-xs tracking-widest">الفحوصات المطلوبة</th>
                                <th className="p-5 font-black text-gray-500 uppercase text-xs tracking-widest text-center">التاريخ</th>
                                <th className="p-5 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الحالة</th>
                                <th className="p-5 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {groupedResults.map(group => {
                                const allDone = group.every(o => o.status === TestStatus.Completed);
                                return (
                                    <tr key={`${group[0].patientId}-${group[0].orderDate}`} className={`hover:bg-teal-50/30 transition ${allDone ? 'bg-blue-50/5' : ''}`}>
                                        <td className="p-5">
                                            <div className="font-black text-gray-800 text-sm">{group[0].patientName}</div>
                                            <div className="text-[9px] text-gray-400 font-black">ID: #{String(group[0].patientId).padStart(5, '0').slice(-5)}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-2">
                                                {group.map(o => (
                                                    <span key={o.id} className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${o.status === TestStatus.Completed ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                        {o.testName} {o.result ? (o.isProfile ? '(مكتمل)' : `(${o.result})`) : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center text-gray-500 font-bold text-xs">{group[0].orderDate}</td>
                                        <td className="p-5 text-center">
                                            {allDone ? (
                                                <span style={{ width: '114px', height: 'auto', display: 'inline-block' }} className="px-3 py-1 text-[9px] font-black rounded-full bg-blue-100 text-blue-700">مكتمل</span>
                                            ) : (
                                                <span style={{ width: '114px', height: 'auto', display: 'inline-block' }} className="px-3 py-1 text-[9px] font-black rounded-full bg-yellow-100 text-yellow-700">بانتظار الإدخال</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-center">
                                            <button onClick={() => setSelectedPatientGroup(group)} className={`${allDone ? 'bg-blue-600' : 'bg-teal-600'} text-white px-6 py-2 rounded-xl text-[10px] font-black shadow-sm transition hover:scale-105`}>
                                                {allDone ? 'مراجعة/تعديل' : 'إدخال النتائج'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;
