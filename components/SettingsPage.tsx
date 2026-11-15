import React, { useState, useEffect } from 'react';
import { HL7Settings, LabSettings, FavoriteGroup, TestCategory } from '../types';

const ReportPreview: React.FC<{ settings: LabSettings }> = ({ settings }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 w-full h-full scale-90 origin-top flex flex-col" style={{ fontFamily: settings.fontFamily }}>
            <div 
                className="flex justify-between items-start border-b-4 pb-3 mb-3" 
                style={{ borderBottomColor: settings.headerColor }}
            >
                <div className="flex gap-4 items-start">
                    {settings.logoUrl && (
                        <img 
                            src={settings.logoUrl} 
                            alt="Logo" 
                            className="object-contain"
                            style={{ width: settings.logoSize, height: settings.logoSize }} 
                        />
                    )}
                    <div>
                        <h2 
                            className="font-black mb-1 transition-all" 
                            style={{ color: settings.headerColor, fontSize: `${settings.labNameFontSize}rem` }}
                        >
                            {settings.labName || "اسم المختبر"}
                        </h2>
                        <div className="text-gray-500 font-bold space-y-1 text-xs">
                            <p>{settings.address || "العنوان هنا"}</p>
                            <p>هاتف: {settings.phone || "رقم الهاتف"}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-y-3 gap-x-6 border">
                <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 font-black text-xs">المريض:</span>
                    <span 
                        className="text-gray-900 font-black"
                        style={{ fontSize: `${settings.patientNameFontSize}rem` }}
                    >
                        اسم المريض الافتراضي
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-black text-xs">تاريخ التقرير:</span>
                    <span className="text-gray-900 font-bold text-sm">dd/mm/yyyy</span>
                </div>
            </div>

            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b-2" style={{ borderBottomColor: settings.headerColor }}>
                        <th className="py-2 font-black text-xs" style={{ color: settings.headerColor }}>الفحص</th>
                        <th className="py-2 font-black text-xs text-center" style={{ color: settings.headerColor }}>النتيجة</th>
                        <th className="py-2 font-black text-xs text-center" style={{ color: settings.headerColor }}>النطاق</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-3 font-bold text-gray-800 text-sm">HGB</td>
                        <td 
                            className="py-3 font-black text-center" 
                            style={{ color: settings.headerColor, fontSize: `${settings.resultsFontSize}rem` }}
                        >
                            14.2
                        </td>
                        <td className="py-3 font-bold text-gray-400 text-center text-xs">13.8-17.2</td>
                    </tr>
                </tbody>
            </table>

            {settings.showPreviousResults && (
                 <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-400 font-bold border">
                    سيتم عرض النتائج السابقة هنا
                 </div>
            )}
             <div className="mt-auto pt-4 border-t-2 border-dashed flex justify-between items-end text-[10px] text-gray-500">
                <div>
                    <p className="font-bold text-gray-700">الفني المختص:</p>
                    <p>{settings.technician}</p>
                </div>
                <div>
                    <p className="font-bold text-gray-700">المحاسب:</p>
                    <p>{settings.accountantName}</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-700">مدير المختبر:</p>
                    <p>د. {settings.labDirector}</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-700">مراجعة الجودة:</p>
                    <p>د. {settings.qcDoctor}</p>
                </div>
            </div>
        </div>
    );
};


const SettingsPage: React.FC<{
    hl7Settings: HL7Settings;
    labSettings: LabSettings;
    onSaveHL7: (settings: HL7Settings) => void;
    onSaveLab: (settings: LabSettings) => void;
    favoriteGroups: FavoriteGroup[];
    onAddFavoriteGroup: (group: Omit<FavoriteGroup, 'id'>) => void;
    onUpdateFavoriteGroup: (group: FavoriteGroup) => void;
    onDeleteFavoriteGroup: (id: string) => void;
    testData: TestCategory[];
}> = ({ hl7Settings, labSettings, onSaveHL7, onSaveLab, favoriteGroups, onAddFavoriteGroup, onUpdateFavoriteGroup, onDeleteFavoriteGroup, testData }) => {
    const [activeTab, setActiveTab] = useState<'lab' | 'hl7' | 'favorites'>('lab');
    const [tempHl7, setTempHl7] = useState<HL7Settings>(hl7Settings);
    const [tempLab, setTempLab] = useState<LabSettings>(labSettings);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setTempHl7(hl7Settings);
    }, [hl7Settings]);

    useEffect(() => {
        setTempLab(labSettings);
    }, [labSettings]);

    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [editingGroup, setEditingGroup] = useState<FavoriteGroup | null>(null);
    const [groupForm, setGroupForm] = useState<{ name: string; testNames: string[] }>({ name: '', testNames: [] });

    const allTestsFlat = testData.flatMap(cat => cat.groups.flatMap(g => g.tests));

    useEffect(() => {
        if (editingGroup) {
            setGroupForm({ name: editingGroup.name, testNames: editingGroup.testNames });
        } else if (isAddingGroup) {
            setGroupForm({ name: '', testNames: [] });
        }
    }, [editingGroup, isAddingGroup]);

    const toggleTestInGroup = (testName: string) => {
        setGroupForm(prev => ({
            ...prev,
            testNames: prev.testNames.includes(testName)
                ? prev.testNames.filter(t => t !== testName)
                : [...prev.testNames, testName]
        }));
    };

    const handleSaveGroup = () => {
        if (editingGroup) {
            onUpdateFavoriteGroup({ ...editingGroup, ...groupForm });
        } else {
            onAddFavoriteGroup(groupForm);
        }
        setIsAddingGroup(false);
        setEditingGroup(null);
        triggerSuccess();
    };

    const handleSaveHL7 = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveHL7(tempHl7);
        triggerSuccess();
    };

    const handleSaveLab = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveLab(tempLab);
        triggerSuccess();
    };

    const triggerSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const SliderControl: React.FC<{label: string, value: number, onChange: (v: number) => void, min: number, max: number, step: number, unit: string}> = 
    ({ label, value, onChange, min, max, step, unit }) => (
        <div className="space-y-2">
            <label className="block text-[12px] font-black text-gray-500 uppercase tracking-wider flex justify-between items-center">
                <span>{label}</span>
                <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{value}{unit}</span>
            </label>
            <input 
                type="range" 
                value={value} 
                onChange={e => onChange(Number(e.target.value))}
                min={min} max={max} step={step}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );

    const DEFAULT_LAB_SETTINGS: LabSettings = {
        labName: 'مختبر الشفاء الطبي التخصصي',
        address: 'دمشق - البحصة - بناء النخبة',
        phone: '011-2332737 / 0992191884',
        labDirector: 'د. الخليل',
        accountantName: 'أحمد المحاسب',
        qcDoctor: 'د. سارة الأحمد',
        technician: 'الفني محمود يوسف',
        headerColor: '#0d9488',
        logoSize: 96,
        fontFamily: 'Cairo, sans-serif',
        labNameFontSize: 2,
        patientNameFontSize: 1.2,
        resultsFontSize: 2,
        showPreviousResults: true,
        unitPrice: 1000,
    };

    const handleResetLab = () => {
        if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
            setTempLab(DEFAULT_LAB_SETTINGS);
        }
    };

    return (
        <div className="mx-auto space-y-6">
            {showSuccess && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-8 py-3 rounded-2xl shadow-2xl z-[200] font-black animate-fade-in flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    تم حفظ التغييرات بنجاح
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('lab')}
                        className={`flex-1 py-4 text-sm font-black transition-colors ${activeTab === 'lab' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        تصميم التقارير وهوية المختبر
                    </button>
                    <button 
                        onClick={() => setActiveTab('hl7')}
                        className={`flex-1 py-4 text-sm font-black transition-colors ${activeTab === 'hl7' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        إعدادات ربط الأجهزة (HL7)
                    </button>
                    <button 
                        onClick={() => setActiveTab('favorites')}
                        className={`flex-1 py-4 text-sm font-black transition-colors ${activeTab === 'favorites' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        المجموعات المفضلة
                    </button>
                </div>

                <div>
                    {activeTab === 'lab' ? (
                        <form onSubmit={handleSaveLab}>
                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Controls Column */}
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700 text-lg">المعلومات الأساسية وبيانات الكادر</h3>
                                            <button 
                                                type="button"
                                                onClick={handleResetLab}
                                                className="text-[12px] font-black text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                                استعادة الافتراضي
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[12px] font-black text-gray-400 mr-1">اسم المختبر</label>
                                                <input type="text" placeholder="اسم المختبر" value={tempLab.labName} onChange={e => setTempLab({...tempLab, labName: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[12px] font-black text-gray-400 mr-1">عنوان المختبر</label>
                                                <input type="text" placeholder="عنوان المختبر" value={tempLab.address} onChange={e => setTempLab({...tempLab, address: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[12px] font-black text-gray-400 mr-1">رقم الهاتف</label>
                                                <input type="text" placeholder="رقم الهاتف" value={tempLab.phone} onChange={e => setTempLab({...tempLab, phone: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[12px] font-black text-gray-400 mr-1">رابط صورة الشعار (URL)</label>
                                                <input type="text" placeholder="رابط صورة الشعار (URL)" value={tempLab.logoUrl || ''} onChange={e => setTempLab({...tempLab, logoUrl: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[12px] font-black text-gray-400 mr-1">مدير المختبر</label>
                                                    <input type="text" placeholder="اسم مدير المختبر" value={tempLab.labDirector} onChange={e => setTempLab({...tempLab, labDirector: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[12px] font-black text-gray-400 mr-1">المحاسب</label>
                                                    <input type="text" placeholder="اسم المحاسب" value={tempLab.accountantName} onChange={e => setTempLab({...tempLab, accountantName: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[12px] font-black text-gray-400 mr-1">طبيب الجودة</label>
                                                    <input type="text" placeholder="اسم طبيب الجودة" value={tempLab.qcDoctor} onChange={e => setTempLab({...tempLab, qcDoctor: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[12px] font-black text-gray-400 mr-1">الفني المسؤول</label>
                                                    <input type="text" placeholder="اسم الفني المسؤول" value={tempLab.technician} onChange={e => setTempLab({...tempLab, technician: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[12px] font-black text-gray-500 uppercase tracking-wider">سعر الوحدة (ل.س)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="سعر الوحدة" 
                                                    value={tempLab.unitPrice} 
                                                    onChange={e => setTempLab({...tempLab, unitPrice: Number(e.target.value)})} 
                                                    className="w-full p-2.5 border border-teal-200 rounded-lg font-black bg-teal-50 text-teal-700 text-lg" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-6 border-t">
                                        <h3 className="font-bold text-gray-700 text-lg">تصميم التقرير</h3>
                                        <SliderControl label="حجم الشعار" value={tempLab.logoSize} onChange={v => setTempLab({...tempLab, logoSize: v})} min={40} max={150} step={2} unit="px" />
                                        <SliderControl label="حجم خط اسم المختبر" value={tempLab.labNameFontSize} onChange={v => setTempLab({...tempLab, labNameFontSize: v})} min={1} max={3} step={0.1} unit="rem" />
                                        <SliderControl label="حجم خط اسم المريض" value={tempLab.patientNameFontSize} onChange={v => setTempLab({...tempLab, patientNameFontSize: v})} min={0.8} max={2} step={0.1} unit="rem" />
                                        <SliderControl label="حجم خط النتائج" value={tempLab.resultsFontSize} onChange={v => setTempLab({...tempLab, resultsFontSize: v})} min={1} max={3} step={0.1} unit="rem" />
                                        <div className="space-y-2">
                                            <label className="block text-[12px] font-black text-gray-500 uppercase tracking-wider">الخط الرئيسي للتقرير</label>
                                            <select value={tempLab.fontFamily} onChange={e => setTempLab({...tempLab, fontFamily: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold bg-gray-50 text-[14px]">
                                                <option value="Cairo, sans-serif">Cairo (Recommended for Arabic)</option>
                                                <option value="Arial, sans-serif">Arial</option>
                                                <option value="Times New Roman, serif">Times New Roman</option>
                                                <option value="Courier New, monospace">Courier New</option>
                                            </select>
                                        </div>
                                         <div className="space-y-2">
                                            <label className="block text-[12px] font-black text-gray-500 uppercase tracking-wider">لون ترويسة التقارير</label>
                                            <div className="flex gap-3">
                                                <input type="color" value={tempLab.headerColor} onChange={e => setTempLab({...tempLab, headerColor: e.target.value})} className="w-12 h-12 border-none rounded-xl cursor-pointer" />
                                                <input type="text" value={tempLab.headerColor} onChange={e => setTempLab({...tempLab, headerColor: e.target.value})} className="flex-1 p-2.5 border border-gray-200 rounded-lg font-mono uppercase text-[14px]" />
                                            </div>
                                        </div>
                                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <label htmlFor="show-prev" className="text-sm font-bold text-gray-700 cursor-pointer">عرض النتائج السابقة للمريض في التقرير</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" id="show-prev" checked={tempLab.showPreviousResults} onChange={e => setTempLab({...tempLab, showPreviousResults: e.target.checked})} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* Preview Column */}
                                <div className="bg-gray-100 p-4 rounded-2xl border flex items-center justify-center min-h-[500px]">
                                    <ReportPreview settings={tempLab} />
                                </div>
                            </div>
                             <div className="p-6 flex justify-end bg-gray-50/50 border-t">
                                <button type="submit" className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition active:scale-95">
                                    حفظ إعدادات الهوية والتقارير
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-8">
                            <form onSubmit={handleSaveHL7} className="space-y-8 animate-fade-in max-w-lg mx-auto">
                                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div>
                                        <h4 className="text-lg font-black text-gray-800">تفعيل التكامل عبر بروتوكول HL7</h4>
                                        <p className="text-sm text-gray-400 font-bold">السماح للنظام باستقبال النتائج من أجهزة التحليل آلياً.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={tempHl7.enabled} 
                                            onChange={e => setTempHl7({...tempHl7, enabled: e.target.checked})} 
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                                    </label>
                                </div>

                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${tempHl7.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">عنوان الـ IP لخادم الاستقبال</label>
                                        <input 
                                            type="text" 
                                            value={tempHl7.ipAddress} 
                                            onChange={e => setTempHl7({...tempHl7, ipAddress: e.target.value})}
                                            className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 font-mono font-bold bg-gray-50/50"
                                            placeholder="127.0.0.1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">المنفذ (Port)</label>
                                        <input 
                                            type="number" 
                                            value={tempHl7.port} 
                                            onChange={e => setTempHl7({...tempHl7, port: Number(e.target.value)})}
                                            className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 font-mono font-bold bg-gray-50/50"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end">
                                    <button type="submit" className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition active:scale-95">
                                        حفظ إعدادات HL7
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="p-8 space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-800">مجموعات الفحوصات المفضلة</h3>
                                    <p className="text-sm text-gray-400 font-bold">قم بإنشاء مجموعات فحوصات مخصصة للوصول السريع عند إنشاء الطلبات.</p>
                                </div>
                                <button 
                                    onClick={() => setIsAddingGroup(true)}
                                    className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-lg transition active:scale-95 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                    إضافة مجموعة جديدة
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favoriteGroups.map(group => (
                                    <div key={group.id} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-teal-700 text-lg">{group.name}</h4>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingGroup(group)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
                                                <button onClick={() => { if(confirm('هل أنت متأكد من حذف هذه المجموعة؟')) onDeleteFavoriteGroup(group.id)}} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {group.testNames.map(name => (
                                                <span key={name} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add/Edit Modal */}
                            {(isAddingGroup || editingGroup) && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                                        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                                            <h3 className="text-2xl font-black text-gray-800">
                                                {editingGroup ? 'تعديل مجموعة مفضلة' : 'إضافة مجموعة مفضلة جديدة'}
                                            </h3>
                                            <button onClick={() => { setIsAddingGroup(false); setEditingGroup(null); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                            </button>
                                        </div>
                                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-black text-gray-700">اسم المجموعة</label>
                                                <input 
                                                    type="text" 
                                                    value={groupForm.name}
                                                    onChange={e => setGroupForm({...groupForm, name: e.target.value})}
                                                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all font-bold text-lg"
                                                    placeholder="مثلاً: فحوصات ما قبل الزواج"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-sm font-black text-gray-700">اختر الفحوصات</label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {allTestsFlat.map(test => (
                                                        <button
                                                            key={test.name}
                                                            type="button"
                                                            onClick={() => toggleTestInGroup(test.name)}
                                                            className={`p-3 rounded-2xl border-2 text-right transition-all flex flex-col gap-1 ${
                                                                groupForm.testNames.includes(test.name)
                                                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                            }`}
                                                        >
                                                            <span className="font-black text-sm">{test.abbreviation || test.name}</span>
                                                            <span className="text-[10px] opacity-60">{test.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-gray-50 border-t flex gap-4">
                                            <button 
                                                onClick={() => { setIsAddingGroup(false); setEditingGroup(null); }}
                                                className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-black hover:bg-gray-100 transition-all"
                                            >
                                                إلغاء
                                            </button>
                                            <button 
                                                onClick={handleSaveGroup}
                                                disabled={!groupForm.name || groupForm.testNames.length === 0}
                                                className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all disabled:opacity-50"
                                            >
                                                حفظ المجموعة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;