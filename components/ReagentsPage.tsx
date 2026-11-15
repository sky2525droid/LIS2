
import React, { useState, useMemo } from 'react';
import { Reagent } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReagentsPageProps {
    reagents: Reagent[];
    onAdd: (reagent: Omit<Reagent, 'id' | 'lastUpdated'>) => Promise<void>;
    onUpdate: (reagent: Reagent) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ReagentsPage: React.FC<ReagentsPageProps> = ({ reagents, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReagent, setCurrentReagent] = useState<Partial<Reagent> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReagents = useMemo(() => {
        return reagents.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [reagents, searchTerm]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentReagent?.name) return;

        try {
            if (currentReagent.id) {
                await onUpdate(currentReagent as Reagent);
            } else {
                await onAdd(currentReagent as Omit<Reagent, 'id' | 'lastUpdated'>);
            }
            setIsModalOpen(false);
            setCurrentReagent(null);
        } catch (error) {
            console.error("Failed to save reagent", error);
        }
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الكاشف؟')) {
            onDelete(id);
        }
    };

    const lowStockReagents = useMemo(() => {
        return reagents.filter(r => r.quantity <= r.minQuantity);
    }, [reagents]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans" dir="rtl">
            <AnimatePresence>
                {lowStockReagents.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 animate-pulse">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div className="flex-1 text-center md:text-right">
                                <h2 className="text-xl font-black text-red-900 mb-1">تنبيه: نقص في المخزون!</h2>
                                <p className="text-red-700 font-bold opacity-80">
                                    هناك {lowStockReagents.length} كواشف وصلت للحد الأدنى المسموح به. يرجى مراجعة الطلبيات.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {lowStockReagents.slice(0, 3).map(r => (
                                    <span key={r.id} className="bg-white px-4 py-2 rounded-xl text-red-600 font-black text-sm border border-red-100 shadow-sm">
                                        {r.name}
                                    </span>
                                ))}
                                {lowStockReagents.length > 3 && (
                                    <span className="bg-red-200 px-4 py-2 rounded-xl text-red-800 font-black text-sm">
                                        +{lowStockReagents.length - 3} أخرى
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-teal-600 tracking-tight">مستودع الكواشف المخبرية</h1>
                    <p className="text-gray-500 font-medium">إدارة ومتابعة مخزون الكواشف والمحاليل</p>
                </div>
                <button 
                    onClick={() => { setCurrentReagent({ quantity: 0, minQuantity: 0, unit: 'ml' }); setIsModalOpen(true); }}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition transform active:scale-95 shadow-lg shadow-teal-100 flex items-center gap-2"
                >
                    <span>+ إضافة كاشف جديد</span>
                </button>
            </header>

            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:max-w-md">
                    <input 
                        type="text"
                        placeholder="البحث عن كاشف باسمه..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition shadow-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>

                <div className="flex gap-4">
                     <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-bold text-gray-600">منخفض: {reagents.filter(r => r.quantity <= r.minQuantity).length}</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <span className="text-sm font-bold text-gray-600">الإجمالي: {reagents.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredReagents.map((reagent) => (
                        <motion.div 
                            key={reagent.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
                        >
                            {reagent.quantity <= reagent.minQuantity && (
                                <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{reagent.name}</h3>
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${reagent.quantity <= reagent.minQuantity ? 'bg-red-50 border-red-200 text-red-600' : 'bg-teal-50 border-teal-200 text-teal-600'}`}>
                                    {reagent.quantity <= reagent.minQuantity ? 'مخزون منخفض' : 'متوفر'}
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-500 font-medium">الكمية الحالية:</span>
                                        <span className={`font-black ${reagent.quantity <= reagent.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>{reagent.quantity} {reagent.unit}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (reagent.quantity / (reagent.minQuantity * 3)) * 100)}%` }}
                                            className={`h-full ${reagent.quantity <= reagent.minQuantity ? 'bg-red-500' : 'bg-teal-500'}`}
                                        ></motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">تاريخ الانتهاء</p>
                                        <p className={`text-xs font-bold ${new Date(reagent.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>{reagent.expiryDate}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">المورد</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{reagent.supplier}</p>
                                    </div>
                                </div>

                                <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                                    <span>آخر تحديث:</span>
                                    <span>{new Date(reagent.lastUpdated).toLocaleString('ar-SY')}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setCurrentReagent(reagent); setIsModalOpen(true); }}
                                    className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition transform active:scale-95 shadow-sm"
                                >
                                    تعديل
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(reagent.id)}
                                    className="px-4 bg-red-50 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition transform active:scale-95"
                                >
                                    حذف
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900">{currentReagent?.id ? 'تعديل بيانات الكاشف' : 'إضافة كاشف جديد للمستودع'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setCurrentReagent(null); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-gray-700 mb-2">اسم الكاشف / المحلول</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="مثال: كاشف السكر"
                                        value={currentReagent?.name || ''}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">الكمية الحالية</label>
                                    <input 
                                        type="number"
                                        required
                                        value={currentReagent?.quantity || 0}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">الوحدة (ml, pack...)</label>
                                    <input 
                                        type="text"
                                        required
                                        value={currentReagent?.unit || ''}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, unit: e.target.value }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">حد الإنذار الأدنى</label>
                                    <input 
                                        type="number"
                                        required
                                        value={currentReagent?.minQuantity || 0}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, minQuantity: Number(e.target.value) }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2">تاريخ انتهاء الصلاحية</label>
                                    <input 
                                        type="date"
                                        required
                                        value={currentReagent?.expiryDate || ''}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-gray-700 mb-2">المورد / المصنع</label>
                                    <input 
                                        type="text"
                                        required
                                        value={currentReagent?.supplier || ''}
                                        onChange={(e) => setCurrentReagent(prev => ({ ...prev, supplier: e.target.value }))}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-teal-500 transition shadow-inner font-bold text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black hover:bg-teal-700 shadow-xl shadow-teal-100 transition transform active:scale-95 text-lg"
                                >
                                    حفظ التغييرات
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setCurrentReagent(null); }}
                                    className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ReagentsPage;
