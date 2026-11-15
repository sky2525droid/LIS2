import React, { useState } from 'react';
import { TestOrder, TestStatus } from '../types';

const ResultForm: React.FC<{
    orders: TestOrder[];
    onClose: () => void;
    updateOrderStatus: (orderId: number, status: TestStatus, result: string | null, isAutoApproved?: boolean, notes?: string) => void;
}> = ({ orders, onClose, updateOrderStatus }) => {
    const [results, setResults] = useState<Record<number, Record<string, string> | string>>(
        orders.reduce((acc, o) => {
            if (o.isProfile && o.subTests) {
                let parsed = {};
                if (o.result) {
                    try { parsed = JSON.parse(o.result); } catch (e) {}
                }
                return { ...acc, [o.id]: parsed };
            }
            return { ...acc, [o.id]: o.result || '' };
        }, {})
    );
    const [notes, setNotes] = useState<Record<number, string>>(
        orders.reduce((acc, o) => ({ ...acc, [o.id]: o.notes || '' }), {})
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        orders.forEach(order => {
            const res = results[order.id];
            const finalRes = typeof res === 'object' ? JSON.stringify(res) : res;
            updateOrderStatus(order.id, TestStatus.Completed, finalRes, undefined, notes[order.id] || undefined);
        });
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-bg-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-[320px] overflow-hidden flex flex-col animate-modal-enter max-h-[85vh]">
                <div className="p-2 flex flex-col h-full overflow-hidden">
                    <div className="mb-1.5 flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <div>
                            <h2 className="text-sm font-black text-gray-800">إدخال النتائج</h2>
                            <p className="text-teal-600 font-bold text-[8px] mt-0.5">
                                {orders[0].patientName}
                            </p>
                        </div>
                        <div className="text-[8px] font-bold text-gray-400 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                           {orders[0].orderDate}
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                            {orders.map((order, index) => (
                                <div key={order.id} className="bg-gray-50 border border-gray-100 px-2 py-1.5 rounded-lg flex flex-col gap-2 hover:border-teal-200 transition-colors">
                                    <div className="flex items-center justify-between min-w-0 pb-1 border-b border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <h4 className="font-black text-gray-700 text-[10px] truncate">{order.testName}</h4>
                                            {order.isProfile && <span className="bg-teal-100 text-teal-600 text-[8px] font-bold px-1 rounded">باقة</span>}
                                        </div>
                                        {!order.isProfile && (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase dir-ltr text-right truncate" title={order.normalRange}>{order.normalRange}</p>
                                        )}
                                    </div>
                                    {order.isProfile && order.subTests ? (
                                        <div className="flex flex-col gap-1 mt-1">
                                            {order.subTests.map((subTest, subIndex) => (
                                                <div key={subTest.name} className="flex items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[9px] font-bold text-gray-600 truncate block">{subTest.name}</span>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase dir-ltr text-right truncate block">{subTest.normalRange}</span>
                                                    </div>
                                                    <div className="w-20">
                                                        <input 
                                                            type="text" 
                                                            value={((results[order.id] as Record<string, string>) || {})[subTest.name] || ''} 
                                                            onChange={e => setResults({ 
                                                                ...results, 
                                                                [order.id]: {
                                                                    ...(results[order.id] as Record<string, string> || {}),
                                                                    [subTest.name]: e.target.value
                                                                }
                                                            })} 
                                                            className="w-full p-1 border border-gray-200 rounded focus:ring-2 focus:ring-teal-500 bg-white text-[10px] font-black text-center shadow-sm" 
                                                            placeholder="النتيجة"
                                                            autoFocus={index === 0 && subIndex === 0}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex justify-end w-full">
                                            <input 
                                                type="text" 
                                                value={(results[order.id] as string) || ''} 
                                                onChange={e => setResults({ ...results, [order.id]: e.target.value })} 
                                                className="w-full p-1 border border-gray-200 rounded focus:ring-2 focus:ring-teal-500 bg-white text-[10px] font-black text-center shadow-sm" 
                                                placeholder="النتيجة"
                                                autoFocus={index === 0}
                                            />
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        <textarea
                                            value={notes[order.id] || ''}
                                            onChange={e => setNotes({ ...notes, [order.id]: e.target.value })}
                                            className="w-full p-1 border border-gray-200 rounded focus:ring-2 focus:ring-teal-500 bg-white text-[9px] shadow-sm resize-none"
                                            placeholder="ملاحظات (اختياري)..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-1.5 pt-2 mt-1 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 text-[10px] transition-colors">إلغاء</button>
                            <button type="submit" className="flex-[2] px-2 py-1.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-md transition-all active:scale-95 text-[10px]">حفظ</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResultForm;