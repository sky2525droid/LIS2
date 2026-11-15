import React, { useState, useMemo } from 'react';
import { TestOrder, TestStatus, LabSettings } from '../types';
import ViewSwitcher from './ViewSwitcher';
import { ReportPrintModal } from './OrderList';

type RangeStatus = 'normal' | 'high' | 'low' | 'unknown';

const getRangeStatus = (result: string | null, range?: string): RangeStatus => {
    if (!result || !range) return 'unknown';
    
    // Extract numeric part from result (e.g. "14.2 g/dL" -> 14.2)
    const resultMatch = result.match(/(-?\d+\.?\d*)/);
    if (!resultMatch) {
        // Qualitative check (case insensitive) if no numeric match found in range
        return result.toLowerCase().trim() === range.toLowerCase().trim() ? 'normal' : 'unknown';
    }
    const numResult = parseFloat(resultMatch[1]);

    // Numeric range check
    // 1. X - Y (handles spaces and units after)
    const dashMatch = range.match(/(-?\d+\.?\d*)\s*-\s*(-?\d+\.?\d*)/);
    if (dashMatch) {
        const min = parseFloat(dashMatch[1]);
        const max = parseFloat(dashMatch[2]);
        if (numResult < min) return 'low';
        if (numResult > max) return 'high';
        return 'normal';
    }

    // 2. < X or <= X
    const lessMatch = range.match(/([<≤])\s*(-?\d+\.?\d*)/);
    if (lessMatch) {
        const val = parseFloat(lessMatch[2]);
        const isLess = lessMatch[1] === '<' ? numResult < val : numResult <= val;
        return isLess ? 'normal' : 'high';
    }

    // 3. > X or >= X
    const greaterMatch = range.match(/([>≥])\s*(-?\d+\.?\d*)/);
    if (greaterMatch) {
        const val = parseFloat(greaterMatch[2]);
        const isGreater = greaterMatch[1] === '>' ? numResult > val : numResult >= val;
        return isGreater ? 'normal' : 'low';
    }

    return 'unknown';
};

const isWithinNormalRange = (result: string | null, range?: string): boolean => {
    return getRangeStatus(result, range) === 'normal';
};

const QCReviewModal: React.FC<{
    group: TestOrder[];
    onClose: () => void;
    updateOrderStatus: (orderId: number, status: TestStatus, result: string | null, isAutoApproved?: boolean, notes?: string) => void;
}> = ({ group, onClose, updateOrderStatus }) => {
    const [notes, setNotes] = useState<Record<number, string>>(
        group.reduce((acc, o) => ({ ...acc, [o.id]: o.notes || '' }), {})
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 animate-bg-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter">
                <div className="p-6 bg-teal-700 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">مراجعة واعتماد النتائج</h2>
                        <p className="text-teal-100 text-xs mt-1">المريض: {group[0].patientName} | ملف رقم: #{group[0].patientId}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    <div className="space-y-4">
                        {group.map(o => {
                            const isApproved = o.status === TestStatus.Approved || o.status === TestStatus.Delivered;
                            const rangeStatus = getRangeStatus(o.result, o.normalRange);
                            const isNormal = rangeStatus === 'normal';
                            
                            return (
                                <div key={o.id} className={`bg-white p-5 rounded-2xl border transition-all ${isApproved ? 'border-green-100 bg-green-50/10' : isNormal ? 'border-teal-200 bg-teal-50/10' : rangeStatus === 'high' || rangeStatus === 'low' ? 'border-red-200 bg-red-50/5' : 'border-gray-200 shadow-sm'}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-gray-800">{o.testName}</h4>
                                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 font-mono">#{o.id}</span>
                                                {o.isAutoApproved && (
                                                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-[10px] font-black">اعتماد آلي</span>
                                                )}
                                                {!isApproved && (
                                                    <>
                                                        {rangeStatus === 'normal' && (
                                                            <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded text-[10px] font-black border border-teal-100">ضمن النطاق</span>
                                                        )}
                                                        {rangeStatus === 'high' && (
                                                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black border border-red-100">High</span>
                                                        )}
                                                        {rangeStatus === 'low' && (
                                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black border border-blue-100">Low</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase">النتيجة</span>
                                                    <span className={`text-xl font-black ${isApproved ? 'text-green-700' : 'text-teal-600'}`}>{o.result || '---'}</span>
                                                </div>
                                                <div className="flex flex-col border-r pr-4 border-gray-100">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase">النطاق الطبيعي</span>
                                                    <span className="text-sm font-bold text-gray-500">{o.normalRange}</span>
                                                </div>
                                                {o.notes && (
                                                    <div className="flex flex-col border-r pr-4 border-gray-100 max-w-[200px]">
                                                        <span className="text-[10px] text-gray-400 font-black uppercase">ملاحظات</span>
                                                        <span className="text-xs font-bold text-gray-500 truncate" title={o.notes}>{o.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            {isApproved ? (
                                                <div className="flex items-center gap-2 text-green-600 font-black bg-green-50 px-4 py-2 rounded-xl border border-green-200 text-sm">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                    تم الاعتماد
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 items-end">
                                                    <textarea
                                                        value={notes[o.id] || ''}
                                                        onChange={e => setNotes({ ...notes, [o.id]: e.target.value })}
                                                        placeholder="أضف ملاحظة (اختياري)..."
                                                        className="w-[180px] p-2 text-[10px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                                                        rows={2}
                                                    />
                                                    <button 
                                                        onClick={() => updateOrderStatus(o.id, TestStatus.Approved, o.result, undefined, notes[o.id] || undefined)}
                                                        className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-black hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-95 text-sm w-full"
                                                    >
                                                        اعتماد النتيجة
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-white border-t flex justify-end gap-3">
                    <button 
                        onClick={() => {
                            const pending = group.filter(o => o.status === TestStatus.Completed);
                            if (pending.length > 0 && confirm(`هل تريد اعتماد كافة الفحوصات المتبقية (${pending.length}) دفعة واحدة؟`)) {
                                pending.forEach(o => updateOrderStatus(o.id, TestStatus.Approved, o.result, undefined, notes[o.id] || undefined));
                            }
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition text-sm"
                    >
                        اعتماد الكل (اختصار)
                    </button>
                    <button onClick={onClose} className="px-10 py-3 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition text-sm">إغلاق النافذة</button>
                </div>
            </div>
        </div>
    );
};

const QualityControlPage: React.FC<{
    orders: TestOrder[];
    updateOrderStatus: (orderId: number, status: TestStatus, result: string | null, isAutoApproved?: boolean) => void;
    labSettings: LabSettings;
}> = ({ orders, updateOrderStatus, labSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | TestStatus.Completed | TestStatus.Approved>('all');
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [printModalData, setPrintModalData] = useState<{ patientName: string; orders: TestOrder[]; allPatientOrders: TestOrder[] } | null>(null);
    const [reviewGroup, setReviewGroup] = useState<TestOrder[] | null>(null);
    const [isAutoApproveEnabled, setIsAutoApproveEnabled] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const autoApprovableCount = useMemo(() => {
        return orders.filter(o => o.status === TestStatus.Completed && isWithinNormalRange(o.result, o.normalRange)).length;
    }, [orders]);

    const handleApplyAutoApprove = () => {
        const toApprove = orders.filter(o => o.status === TestStatus.Completed && isWithinNormalRange(o.result, o.normalRange));
        if (toApprove.length === 0) return;

        if (confirm(`تم العثور على ${toApprove.length} نتيجة ضمن النطاق الطبيعي. هل تريد اعتمادها تلقائياً؟`)) {
            toApprove.forEach(o => updateOrderStatus(o.id, TestStatus.Approved, o.result, true));
            setShowSuccess(`تم اعتماد ${toApprove.length} نتيجة بنجاح.`);
            setTimeout(() => setShowSuccess(null), 3000);
        }
    };

    const relevantOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        return orders.filter(o => {
            const isRelevant = o.status === TestStatus.Completed || o.status === TestStatus.Approved || o.status === TestStatus.Delivered;
            if (!isRelevant) return false;

            const matchesSearch = o.patientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            
            let matchesTime = true;
            if (period === 'today') matchesTime = o.orderDate === todayStr;
            else if (period !== 'all') {
                const orderDateObj = new Date(o.orderDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24));
                if (period === 'week') matchesTime = diffDays <= 7;
                else if (period === 'month') matchesTime = diffDays <= 30;
            }
            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [orders, searchTerm, statusFilter, period]);

    const groupedOrders = useMemo(() => {
        const groups: Record<string, TestOrder[]> = {};
        relevantOrders.forEach(o => {
            const key = `${o.patientId}-${o.orderDate}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(o);
        });
        return Object.values(groups);
    }, [relevantOrders]);

    const handleOpenPrintModal = (group: TestOrder[]) => {
        const patientId = group[0].patientId;
        const allPatientOrders = orders.filter(o => o.patientId === patientId);
        setPrintModalData({
            patientName: group[0].patientName,
            orders: group,
            allPatientOrders,
        });
    };

    return (
        <div className="space-y-6">
            {printModalData && <ReportPrintModal {...printModalData} onClose={() => setPrintModalData(null)} labSettings={labSettings} />}
            
            {reviewGroup && (
                <QCReviewModal 
                    group={reviewGroup} 
                    onClose={() => setReviewGroup(null)} 
                    updateOrderStatus={updateOrderStatus} 
                />
            )}

            {showSuccess && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-800 text-white px-6 py-3 rounded-2xl shadow-2xl z-[200] flex items-center gap-3 animate-bounce-in font-black text-sm">
                    <svg className="w-5 h-5 text-teal-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {showSuccess}
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">ضبط الجودة والاعتماد الطبي</h3>
                    <p className="text-gray-400 font-medium text-sm mt-1">مراجعة النتائج المخبرية المسجلة مجمعة لكل مريض قبل إصدار التقارير.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <span className="text-xs font-black text-gray-500">الاعتماد التلقائي</span>
                        <button 
                            onClick={() => setIsAutoApproveEnabled(!isAutoApproveEnabled)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${isAutoApproveEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoApproveEnabled ? 'right-6' : 'right-1'}`} />
                        </button>
                    </div>
                    {isAutoApproveEnabled && autoApprovableCount > 0 && (
                        <button 
                            onClick={handleApplyAutoApprove}
                            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            اعتماد النتائج الطبيعية ({autoApprovableCount})
                        </button>
                    )}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['today', 'week', 'month', 'all'] as const).map((p) => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${period === p ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                            </button>
                        ))}
                    </div>
                    <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                </div>
            </div>

            {groupedOrders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-1.573a8.956 8.956 0 016.777 0L21 20.417A12.02 12.02 0 0017.618 5.984z"></path></svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-400">لا توجد نتائج بانتظار المراجعة والاعتماد</h3>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest">بيانات المريض</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest">الفحوصات المنجزة</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">تاريخ الفحص</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {groupedOrders.map(group => {
                                const allApproved = group.every(o => o.status === TestStatus.Approved || o.status === TestStatus.Delivered);
                                const hasPendingApproval = group.some(o => o.status === TestStatus.Completed);
                                
                                return (
                                    <tr key={`${group[0].patientId}-${group[0].orderDate}`} className={`transition group ${allApproved ? 'bg-green-50/10 hover:bg-green-50/30' : 'hover:bg-teal-50/30'}`}>
                                        <td className="p-4">
                                            <div className="font-black text-gray-800 text-sm">{group[0].patientName}</div>
                                            <div className="text-[9px] text-gray-400 font-black tracking-widest uppercase">الملف: #{group[0].patientId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {group.map(o => (
                                                    <div key={o.id} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-100 text-[10px]">
                                                        <span className="font-bold text-gray-500">{o.testName}:</span>
                                                        <span className={`font-black ${o.status === TestStatus.Completed ? 'text-blue-700' : 'text-teal-700'}`}>{o.result || '---'}</span>
                                                        {o.isAutoApproved && (
                                                            <span className="bg-teal-100 text-teal-700 px-1 rounded text-[8px] font-black">آلي</span>
                                                        )}
                                                        {(o.status === TestStatus.Approved || o.status === TestStatus.Delivered) && <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                                                        {o.status === TestStatus.Completed && isAutoApproveEnabled && isWithinNormalRange(o.result, o.normalRange) && (
                                                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" title="جاهز للاعتماد التلقائي" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-gray-500 font-bold text-xs">{group[0].orderDate}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                {hasPendingApproval ? (
                                                    <button 
                                                        onClick={() => setReviewGroup(group)} 
                                                        className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-95 flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                        عرض واعتماد النتائج
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-green-600 font-black text-xs flex items-center gap-1.5"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> معتمد طبياً</span>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => setReviewGroup(group)}
                                                                className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition border"
                                                                title="مراجعة التفاصيل"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleOpenPrintModal(group)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-100 transition border border-blue-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                                طباعة
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
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
    );
};

export default QualityControlPage;
