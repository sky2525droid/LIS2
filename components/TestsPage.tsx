
import React, { useState, useMemo, useEffect } from 'react';
import { TestCategory, Test, TestGroup, TubeType } from '../types';
import ViewSwitcher from './ViewSwitcher';
import { testData as initialTestData } from '../data/tests';

interface TestsPageProps {
    testData: TestCategory[];
    updateTestData: (data: TestCategory[]) => void;
    labSettings: import('../types').LabSettings;
}

interface TestModalProps {
    mode: 'add' | 'edit';
    categories: string[];
    initialData?: { category: string; group: string; test: Test };
    onClose: () => void;
    onSave: (catName: string, groupName: string, test: Test, oldContext?: { category: string; group: string; name: string }) => void;
    unitPrice: number;
}

const TestFormModal: React.FC<TestModalProps> = ({ mode, categories, initialData, onClose, onSave, unitPrice }) => {
    const [cat, setCat] = useState(initialData?.category || categories[0] || '');
    const [group, setGroup] = useState(initialData?.group || '');
    const [name, setName] = useState(initialData?.test.name || '');
    const [abbreviation, setAbbreviation] = useState(initialData?.test.abbreviation || '');
    const [shortcut, setShortcut] = useState(initialData?.test.shortcut || '');
    const [range, setRange] = useState(initialData?.test.normalRange || '');
    const [units, setUnits] = useState(initialData?.test.units || '');
    const [price, setPrice] = useState(initialData?.test.price || '');
    const [tubeType, setTubeType] = useState<TubeType | ''>(initialData?.test.tubeType || '');

    // Auto-calculate price when units change
    const handleUnitsChange = (val: string) => {
        setUnits(val);
        if (val) {
            setPrice(Number(val) * unitPrice);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    {mode === 'add' ? 'إضافة فحص مخبري جديد' : 'تعديل بيانات الفحص'}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">القسم الرئيسي</label>
                        <select value={cat} onChange={e => setCat(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 font-semibold text-sm">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">اسم المجموعة (Group)</label>
                        <input type="text" value={group} onChange={e => setGroup(e.target.value)} placeholder="مثلاً: وظائف الكلى" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">اسم الفحص الكامل</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: Glucose" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">الاختصار</label>
                            <input type="text" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} placeholder="مثلاً: GLU" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">رقم الفحص (للسرعة)</label>
                            <input type="text" value={shortcut} onChange={e => setShortcut(e.target.value)} placeholder="مثلاً: 12" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm font-bold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">نوع الأنبوب</label>
                        <select 
                            value={tubeType} 
                            onChange={e => setTubeType(e.target.value as TubeType)} 
                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm"
                        >
                            <option value="">اختر نوع الأنبوب...</option>
                            {Object.values(TubeType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">النطاق الطبيعي والوحدات</label>
                        <input type="text" value={range} onChange={e => setRange(e.target.value)} placeholder="مثلاً: 70-110 mg/dL" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">عدد الوحدات (Units)</label>
                            <input type="number" value={units} onChange={e => handleUnitsChange(e.target.value)} placeholder="مثلاً: 5" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-teal-50 font-bold text-teal-700 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">سعر الفحص (تلقائي)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 4000" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-600 text-sm transition">إلغاء</button>
                    <button 
                        onClick={() => onSave(cat, group, { name, abbreviation, shortcut: shortcut || undefined, normalRange: range, price: Number(price) || undefined, units: Number(units) || undefined, tubeType: (tubeType as TubeType) || undefined }, initialData ? { category: initialData.category, group: initialData.group, name: initialData.test.name } : undefined)} 
                        className="flex-[2] px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg font-bold text-sm transition"
                    >
                        {mode === 'add' ? 'حفظ الفحص' : 'تحديث البيانات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface GroupModalProps {
    initialData: { category: string; group: TestGroup };
    allTestData: TestCategory[];
    onClose: () => void;
    onSave: (categoryName: string, oldGroupName: string, updatedGroup: TestGroup) => void;
    unitPrice: number;
}

const GroupFormModal: React.FC<GroupModalProps> = ({ initialData, allTestData, onClose, onSave, unitPrice }) => {
    const [groupName, setGroupName] = useState(initialData.group.name);
    const [abbreviation, setAbbreviation] = useState(initialData.group.abbreviation || '');
    const [shortcut, setShortcut] = useState(initialData.group.shortcut || '');
    const [units, setUnits] = useState(initialData.group.units?.toString() || '');
    const [price, setPrice] = useState(initialData.group.price?.toString() || '');
    const [tubeType, setTubeType] = useState<TubeType | ''>(initialData.group.tubeType || '');
    const [isProfile, setIsProfile] = useState<boolean>(initialData.group.isProfile || false);
    const [selectedTestNames, setSelectedTestNames] = useState<string[]>(initialData.group.tests.map(t => t.name));
    const [searchTerm, setSearchTerm] = useState('');

    const allTestsFlat = useMemo(() => allTestData.flatMap(c => c.groups.flatMap(g => g.tests)), [allTestData]);

    // Initial calculation and whenever selection changes (Removed auto-calculation to allow manual edit)
    /* useEffect(() => {
        const selectedTests = allTestsFlat.filter(t => selectedTestNames.includes(t.name));
        const totalUnits = selectedTests.reduce((sum, t) => sum + (t.units || 0), 0);
        const totalPrice = selectedTests.reduce((sum, t) => sum + (t.price || 0), 0);
        
        setUnits(totalUnits > 0 ? totalUnits.toString() : '');
        setPrice(totalPrice > 0 ? totalPrice.toString() : '');
    }, [selectedTestNames, allTestsFlat]); */

    const handleToggleTest = (testName: string) => {
        setSelectedTestNames(prev => 
            prev.includes(testName) 
                ? prev.filter(name => name !== testName) 
                : [...prev, testName]
        );
    };

    const handleSaveClick = () => {
        const updatedTests = allTestsFlat.filter(test => selectedTestNames.includes(test.name));
        const updatedGroup: TestGroup = {
            name: groupName,
            abbreviation: abbreviation || undefined,
            shortcut: shortcut || undefined,
            price: Number(price) || undefined,
            units: Number(units) || undefined,
            tubeType: (tubeType as TubeType) || undefined,
            isProfile,
            tests: updatedTests,
        };
        onSave(initialData.category, initialData.group.name, updatedGroup);
    };
    
    const filteredTestData = useMemo(() => {
        if (!searchTerm) return allTestData;
        return allTestData.map(category => ({
            ...category,
            groups: category.groups.map(group => ({
                ...group,
                tests: group.tests.filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()) || (test.abbreviation && test.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())))
            })).filter(group => group.tests.length > 0)
        })).filter(category => category.groups.length > 0);
    }, [allTestData, searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">تعديل مجموعة الفحوصات</h2>
                     <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Test Selection Panel */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                        <div className="mb-4 relative">
                           <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </span>
                           <input 
                                type="text" 
                                placeholder="ابحث عن فحص لإضافته..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2.5 pr-9 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50"
                           />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            <div className="space-y-4">
                                {filteredTestData.map(category => (
                                    <div key={category.category}>
                                        <h3 className="font-bold text-teal-700 text-sm mb-2">{category.category}</h3>
                                        {category.groups.map(group => (
                                            <div key={group.name} className="ml-2 mb-2">
                                                {group.tests.map(test => (
                                                     <label key={test.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                            checked={selectedTestNames.includes(test.name)}
                                                            onChange={() => handleToggleTest(test.name)}
                                                        />
                                                        <span className="text-gray-700 text-sm font-medium">
                                                            {test.abbreviation || test.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Group Details Panel */}
                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border overflow-y-auto">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">اسم المجموعة</label>
                            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">الاختصار</label>
                                <input type="text" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="مثلاً: CBC" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">رقم الفحص (للسرعة)</label>
                                <input type="text" value={shortcut} onChange={e => setShortcut(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold" placeholder="مثلاً: 12" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">نوع الأنبوب</label>
                            <select 
                                value={tubeType} 
                                onChange={e => setTubeType(e.target.value as TubeType)} 
                                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-sm"
                            >
                                <option value="">اختر نوع الأنبوب...</option>
                                {Object.values(TubeType).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 flex justify-between">
                                    <span>عدد الوحدات</span>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const selectedTests = allTestsFlat.filter(t => selectedTestNames.includes(t.name));
                                            setUnits(selectedTests.reduce((sum, t) => sum + (t.units || 0), 0) > 0 ? selectedTests.reduce((sum, t) => sum + (t.units || 0), 0).toString() : '');
                                        }}
                                        className="text-[10px] text-teal-600 hover:text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded"
                                    >حساب تلقائي</button>
                                </label>
                                <input 
                                    type="number" 
                                    value={units} 
                                    onChange={e => setUnits(e.target.value)}
                                    className="w-full p-2.5 border border-gray-200 bg-teal-50 focus:bg-white text-teal-700 rounded-xl font-bold text-sm transition-colors focus:ring-2 focus:ring-teal-500" 
                                    placeholder="0" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 flex justify-between">
                                    <span>سعر المجموعة</span>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const selectedTests = allTestsFlat.filter(t => selectedTestNames.includes(t.name));
                                            setPrice(selectedTests.reduce((sum, t) => sum + (t.price || 0), 0) > 0 ? selectedTests.reduce((sum, t) => sum + (t.price || 0), 0).toString() : '');
                                        }}
                                        className="text-[10px] text-teal-600 hover:text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded"
                                    >حساب تلقائي</button>
                                </label>
                                <input 
                                    type="number" 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full p-2.5 border border-gray-200 bg-gray-50 focus:bg-white text-gray-700 rounded-xl font-bold text-sm transition-colors focus:ring-2 focus:ring-teal-500" 
                                    placeholder="0" 
                                />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border">
                            <h4 className="text-sm font-bold text-gray-600 mb-2">الفحوصات المختارة</h4>
                            <p className="text-3xl font-black text-teal-600">{selectedTestNames.length}</p>
                            <p className="text-xs text-gray-400">فحص/فحوصات</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">باقة متكاملة (Profile)</span>
                                <span className="text-[10px] text-gray-500">يعامل كفحص واحد عند الطلب (مثل CBC)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isProfile} onChange={e => setIsProfile(e.target.checked)} />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-600 transition">إلغاء</button>
                    <button 
                        onClick={handleSaveClick}
                        className="flex-[2] px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg font-bold transition"
                    >
                        تحديث المجموعة
                    </button>
                </div>
            </div>
        </div>
    );
};

const TestsPage: React.FC<TestsPageProps> = ({ testData, updateTestData, labSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalConfig, setModalConfig] = useState<{ mode: 'add' | 'edit', initialData?: { category: string; group: string; test: Test } } | null>(null);
    const [groupModalConfig, setGroupModalConfig] = useState<{ category: string; group: TestGroup } | null>(null);
    
    // Inline Editing States
    const [inlineEditingKey, setInlineEditingKey] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<Test | null>(null);

    // Drag and Drop States
    const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
    const [draggedGroupInfo, setDraggedGroupInfo] = useState<{ catIndex: number, groupIndex: number } | null>(null);

    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const getInlineKey = (cat: string, group: string, testName: string) => `${cat}|${group}|${testName}`;

    const handleSaveTest = (catName: string, groupName: string, updatedTest: Test, oldContext?: { category: string; group: string; name: string }) => {
        let newData = JSON.parse(JSON.stringify(testData)) as TestCategory[];

        if ((modalConfig?.mode === 'edit' || inlineEditingKey) && oldContext) {
            const oldCat = newData.find(c => c.category === oldContext.category);
            if (oldCat) {
                const oldGroup = oldCat.groups.find(g => g.name === oldContext.group);
                if (oldGroup) {
                     const testIndex = oldGroup.tests.findIndex(t => t.name === oldContext.name);
                     if (testIndex > -1) {
                         if (oldContext.category === catName && oldContext.group === groupName) {
                            oldGroup.tests[testIndex] = updatedTest;
                         } else {
                            oldGroup.tests.splice(testIndex, 1);
                         }
                     }
                    if (oldGroup.tests.length === 0) {
                        oldCat.groups = oldCat.groups.filter(g => g.name !== oldContext.group);
                    } else if (oldContext.category !== catName || oldContext.group !== groupName) {
                        // Recalculate old group totals if it's not the target group
                        // oldGroup.units = oldGroup.tests.reduce((sum, t) => sum + (t.units || 0), 0) || undefined;
                        // oldGroup.price = oldGroup.tests.reduce((sum, t) => sum + (t.price || 0), 0) || undefined;
                    }
                }
            }
        }
        
        if (modalConfig?.mode === 'add' || (oldContext && (oldContext.category !== catName || oldContext.group !== groupName))) {
            let targetCat = newData.find(c => c.category === catName);
            if (!targetCat) {
                targetCat = { category: catName, groups: [] };
                newData.push(targetCat);
            }

            let targetGroup = targetCat.groups.find(g => g.name === groupName);
            if (!targetGroup) {
                targetGroup = { name: groupName, tests: [] };
                targetCat.groups.push(targetGroup);
            }
            
            targetGroup.tests.push(updatedTest);
        }

        // Recalculate group totals for the target group
        /* const targetCat = newData.find(c => c.category === catName);
        if (targetCat) {
            const targetGroup = targetCat.groups.find(g => g.name === groupName);
            if (targetGroup && !targetGroup.isProfile) {
                // targetGroup.units = targetGroup.tests.reduce((sum, t) => sum + (t.units || 0), 0) || undefined;
                // targetGroup.price = targetGroup.tests.reduce((sum, t) => sum + (t.price || 0), 0) || undefined;
            }
        } */

        updateTestData(newData);
        setModalConfig(null);
        setInlineEditingKey(null);
        setInlineEditData(null);
    };

    const handleDeleteTest = (catName: string, groupName: string, testName: string) => {
        // Removed window.confirm as it might be blocked in iframe
        let newData = JSON.parse(JSON.stringify(testData)) as TestCategory[];
        const category = newData.find(c => c.category === catName);
        if (category) {
            const group = category.groups.find(g => g.name === groupName);
            if (group) {
                group.tests = group.tests.filter(t => t.name !== testName);
                
                if (group.tests.length === 0) {
                    category.groups = category.groups.filter(g => g.name !== groupName);
                } else {
                    // Recalculate group totals
                    // group.units = group.tests.reduce((sum, t) => sum + (t.units || 0), 0) || undefined;
                    // group.price = group.tests.reduce((sum, t) => sum + (t.price || 0), 0) || undefined;
                }
            }
        }
        updateTestData(newData);
    };
    
    const handleSaveGroup = (categoryName: string, oldGroupName: string, updatedGroup: TestGroup) => {
        const newData = JSON.parse(JSON.stringify(testData)) as TestCategory[];
        const category = newData.find(c => c.category === categoryName);
        if (category) {
            const groupIndex = category.groups.findIndex(g => g.name === oldGroupName);
            if (groupIndex !== -1) {
                category.groups[groupIndex] = updatedGroup;
            }
        }
        updateTestData(newData);
        setGroupModalConfig(null);
    };

    const onCategoryDragStart = (index: number) => {
        setDraggedCategoryIndex(index);
    };

    const onCategoryDrop = (dropIndex: number) => {
        if (draggedCategoryIndex === null || draggedCategoryIndex === dropIndex) return;
        const newData = [...testData];
        const [removed] = newData.splice(draggedCategoryIndex, 1);
        newData.splice(dropIndex, 0, removed);
        updateTestData(newData);
        setDraggedCategoryIndex(null);
    };

    const onGroupDragStart = (catIndex: number, groupIndex: number) => {
        setDraggedGroupInfo({ catIndex, groupIndex });
    };

    const onGroupDrop = (dropCatIndex: number, dropGroupIndex: number) => {
        if (!draggedGroupInfo || (draggedGroupInfo.catIndex === dropCatIndex && draggedGroupInfo.groupIndex === dropGroupIndex)) return;
        
        const newData = JSON.parse(JSON.stringify(testData)) as TestCategory[];
        const sourceCat = newData[draggedGroupInfo.catIndex];
        const targetCat = newData[dropCatIndex];
        
        const [removedGroup] = sourceCat.groups.splice(draggedGroupInfo.groupIndex, 1);
        targetCat.groups.splice(dropGroupIndex, 0, removedGroup);
        
        updateTestData(newData);
        setDraggedGroupInfo(null);
    };

    const filteredData = testData
        .map((category, index) => ({ category, originalIndex: index }))
        .filter(({ category }) => selectedCategory === 'all' || category.category === selectedCategory)
        .map(({ category, originalIndex }) => {
            const filteredGroups = category.groups
                .map((group, gIndex) => {
                    const filteredTests = group.tests.filter(test =>
                        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (test.abbreviation && test.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                     // show group if group name matches, or if any test in it matches
                    if (group.name.toLowerCase().includes(searchTerm.toLowerCase()) || filteredTests.length > 0) {
                        return { group: {...group, tests: filteredTests.length > 0 ? filteredTests : group.tests}, originalGIndex: gIndex };
                    }
                    return null;
                })
                .filter((g): g is NonNullable<typeof g> => g !== null);
            
            return filteredGroups.length > 0 ? { category, groups: filteredGroups, originalIndex } : null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

    return (
        <div className="space-y-6">
            {modalConfig && (
                <TestFormModal 
                    mode={modalConfig.mode}
                    initialData={modalConfig.initialData}
                    categories={testData.map(c => c.category)} 
                    onClose={() => setModalConfig(null)} 
                    onSave={handleSaveTest} 
                    unitPrice={labSettings.unitPrice}
                />
            )}
            {groupModalConfig && (
                <GroupFormModal
                    initialData={groupModalConfig}
                    allTestData={testData}
                    onClose={() => setGroupModalConfig(null)}
                    onSave={handleSaveGroup}
                    unitPrice={labSettings.unitPrice}
                />
            )}
            
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex flex-1 gap-3 w-full">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="ابحث عن فحص أو مجموعة..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pr-8 pl-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-36 p-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 font-bold text-gray-700 cursor-pointer text-[10px]"
                        >
                            <option value="all">جميع الأقسام</option>
                            {testData.map(cat => (
                                <option key={cat.category} value={cat.category}>{cat.category}</option>
                            ))}
                        </select>
                         <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!showResetConfirm ? (
                        <button 
                            onClick={() => setShowResetConfirm(true)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all text-[10px] flex items-center gap-1.5"
                            title="إعادة ضبط الفحوصات للقيم الافتراضية"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            إعادة ضبط الافتراضيات
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 animate-pulse">
                            <span className="text-[9px] font-bold text-red-600 px-1">تأكيد المسح؟</span>
                            <button 
                                onClick={() => {
                                    updateTestData(initialTestData);
                                    setShowResetConfirm(false);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded-md font-bold text-[9px] hover:bg-red-700"
                            >
                                نعم، إعادة ضبط
                            </button>
                            <button 
                                onClick={() => setShowResetConfirm(false)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md font-bold text-[9px] hover:bg-gray-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => setModalConfig({ mode: 'add' })}
                        className="w-full md:w-auto px-4 py-1.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 text-[10px]"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        إضافة فحص جديد
                    </button>
                </div>
            </div>
            
            {filteredData.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {filteredData.map(({ category, groups, originalIndex }) => (
                            <div 
                                key={category.category} 
                                draggable
                                onDragStart={() => onCategoryDragStart(originalIndex)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onCategoryDrop(originalIndex)}
                                className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] transition-all duration-300 ${draggedCategoryIndex === originalIndex ? 'opacity-40 scale-95 border-teal-500 border-dashed' : 'opacity-100'}`}
                            >
                                <div className="bg-teal-50 px-4 py-2 border-b border-teal-100 flex items-center justify-between cursor-move group">
                                    <div className="flex items-center gap-2">
                                        <div className="text-teal-400 group-hover:text-teal-600 transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/></svg>
                                        </div>
                                        <h2 className="text-lg font-black text-teal-800 tracking-tight">{category.category}</h2>
                                    </div>
                                    <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow-inner">
                                        {category.groups.reduce((acc, g) => acc + g.tests.length, 0)} فحص
                                    </span>
                                </div>
                                <div className="p-2.5 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-100 scrollbar-track-transparent">
                                    {groups.map(({ group, originalGIndex }) => (
                                        <div 
                                            key={`${group.name}-${originalGIndex}`} 
                                            draggable
                                            onDragStart={(e) => {
                                                e.stopPropagation();
                                                onGroupDragStart(originalIndex, originalGIndex);
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.stopPropagation();
                                                onGroupDrop(originalIndex, originalGIndex);
                                            }}
                                            className={`space-y-1 p-1.5 rounded-2xl border transition-all duration-200 ${draggedGroupInfo?.catIndex === originalIndex && draggedGroupInfo?.groupIndex === originalGIndex ? 'bg-teal-50 border-teal-200 border-dashed' : 'border-transparent'}`}
                                        >
                                            <div className="flex items-center justify-between group/title">
                                                <div className="flex items-center gap-2">
                                                    <div className="cursor-move text-gray-300 group-hover/title:text-teal-500 transition-colors">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/></svg>
                                                    </div>
                                                    <h3 className="text-sm font-black text-gray-800">{group.name}</h3>
                                                    <button onClick={() => setGroupModalConfig({ category: category.category, group: testData[originalIndex].groups[originalGIndex] })} className="text-gray-400 hover:text-teal-600 opacity-0 group-hover/title:opacity-100 transition-opacity">
                                                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    </button>
                                                </div>
                                                 {group.price && group.price > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        {group.units && (
                                                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                                                {group.units} وحدة
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                                                            {group.price} ل.س
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {group.tests.map((test) => (
                                                    <div key={test.name} className="bg-gray-50 p-1.5 rounded-xl border border-gray-100 hover:border-teal-300 transition-all group relative hover:shadow-sm hover:bg-white">
                                                        <button 
                                                            onClick={() => setModalConfig({ mode: 'edit', initialData: { category: category.category, group: group.name, test } })}
                                                            className="absolute top-1 left-1 p-0.5 bg-white/90 rounded-lg text-gray-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all shadow-xs border border-gray-100 active:scale-90"
                                                            title="تعديل الفحص"
                                                        >
                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                        </button>
                                                        <div className="flex flex-col h-full justify-between">
                                                            <div className="flex flex-col pr-3">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-[11px] font-bold text-gray-700 group-hover:text-teal-700 transition-colors">
                                                                        {test.name}
                                                                    </span>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteTest(category.category, group.name, test.name);
                                                                        }}
                                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5"
                                                                        title="حذف الفحص"
                                                                    >
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                                    </button>
                                                                </div>
                                                                {test.abbreviation && (
                                                                    <span className="text-[8px] font-bold text-teal-600">
                                                                        {test.abbreviation}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between">
                                                                <div className="space-y-0.5">
                                                                    <div>
                                                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest block">النطاق الطبيعي</span>
                                                                        <span className="text-[9px] font-black text-teal-600">{test.normalRange}</span>
                                                                    </div>
                                                                    {(test.tubeType || group.tubeType) && (
                                                                        <div>
                                                                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest block">الأنبوب</span>
                                                                            <span className="text-[8px] font-bold text-gray-600">{test.tubeType || group.tubeType}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {test.price && test.price > 0 && (
                                                                    <div className="flex flex-col items-end gap-0.5">
                                                                        {test.units && (
                                                                            <span className="text-[7px] font-bold text-teal-500">
                                                                                {test.units} وحدة
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[9px] font-black text-green-600 bg-green-50 px-1 py-0.5 rounded-lg border border-green-100">
                                                                            {test.price} ل.س
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">القسم</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">المجموعة</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">اسم الفحص</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">الاختصار</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">نوع الأنبوب</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest">النطاق الطبيعي</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest text-center">الوحدات</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest text-center">السعر</th>
                                    <th className="p-2 font-black text-gray-500 uppercase text-[10px] tracking-widest text-left pl-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map(({ category, groups, originalIndex }) => (
                                    <React.Fragment key={category.category}>
                                        <tr className="bg-teal-50/60">
                                            <td colSpan={9} className="p-2 font-black text-teal-800 text-sm">
                                                {category.category}
                                            </td>
                                        </tr>
                                        {groups.map(({ group }) => (
                                            <React.Fragment key={group.name}>
                                                <tr className="bg-gray-100/70">
                                                    <td colSpan={9} className="py-1 px-4">
                                                        <div className="flex justify-between items-center">
                                                             <span className="font-bold text-gray-700 text-xs">{group.name} {group.abbreviation ? `(${group.abbreviation})` : ''}</span>
                                                             <div className="flex items-center gap-2">
                                                                {group.tubeType && (
                                                                    <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100">
                                                                        {group.tubeType}
                                                                    </span>
                                                                )}
                                                                {group.units && (
                                                                    <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100">
                                                                        {group.units} وحدة
                                                                    </span>
                                                                )}
                                                                {group.price && group.price > 0 && (
                                                                    <span className="text-[9px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                                                                        {group.price} ل.س
                                                                    </span>
                                                                )}
                                                             </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {group.tests.map(test => {
                                                    const isEditing = inlineEditingKey === getInlineKey(category.category, group.name, test.name);
                                                    return (
                                                        <tr key={test.name} className={`border-b border-gray-50 hover:bg-teal-50/30 transition-colors ${isEditing ? 'bg-teal-50/50' : ''}`}>
                                                            <td className="p-2 text-gray-500 font-medium text-[10px]">
                                                                {category.category}
                                                            </td>
                                                            <td className="p-2 text-gray-500 font-medium text-[10px]">
                                                                {group.name}
                                                            </td>
                                                            <td className="p-2 font-bold text-gray-800 text-xs">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={inlineEditData?.name} 
                                                                        onChange={e => setInlineEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                                        className="w-full p-1 border rounded text-xs"
                                                                    />
                                                                ) : test.name}
                                                            </td>
                                                            <td className="p-2 text-teal-700 font-bold text-xs">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={inlineEditData?.abbreviation || ''} 
                                                                        onChange={e => setInlineEditData(prev => prev ? { ...prev, abbreviation: e.target.value } : null)}
                                                                        className="w-full p-1 border rounded text-xs"
                                                                    />
                                                                ) : (test.abbreviation || '-')}
                                                            </td>
                                                            <td className="p-2 text-gray-600 font-medium text-[10px]">
                                                                {isEditing ? (
                                                                    <select 
                                                                        value={inlineEditData?.tubeType || ''} 
                                                                        onChange={e => setInlineEditData(prev => prev ? { ...prev, tubeType: e.target.value as TubeType } : null)}
                                                                        className="w-full p-1 border rounded text-[10px]"
                                                                    >
                                                                        <option value="">اختر...</option>
                                                                        {Object.values(TubeType).map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                ) : (test.tubeType || group.tubeType || '-')}
                                                            </td>
                                                            <td className="p-2 text-gray-600 font-semibold text-xs">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={inlineEditData?.normalRange} 
                                                                        onChange={e => setInlineEditData(prev => prev ? { ...prev, normalRange: e.target.value } : null)}
                                                                        className="w-full p-1 border rounded text-xs"
                                                                    />
                                                                ) : test.normalRange}
                                                            </td>
                                                            <td className="p-2 text-center text-teal-600 font-bold text-xs">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="number" 
                                                                        value={inlineEditData?.units || ''} 
                                                                        onChange={e => {
                                                                            const val = e.target.value;
                                                                            setInlineEditData(prev => prev ? { 
                                                                                ...prev, 
                                                                                units: Number(val) || undefined,
                                                                                price: val ? Number(val) * labSettings.unitPrice : prev.price
                                                                            } : null);
                                                                        }}
                                                                        className="w-12 p-1 border rounded text-xs text-center"
                                                                    />
                                                                ) : (test.units || '-')}
                                                            </td>
                                                            <td className="p-2 text-center text-green-600 font-bold text-xs">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="number" 
                                                                        value={inlineEditData?.price || ''} 
                                                                        onChange={e => setInlineEditData(prev => prev ? { ...prev, price: Number(e.target.value) || undefined } : null)}
                                                                        className="w-20 p-1 border rounded text-xs text-center"
                                                                    />
                                                                ) : (test.price ? `${test.price} ل.س` : '-')}
                                                            </td>
                                                            <td className="p-2 text-left pl-4">
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => handleSaveTest(category.category, group.name, inlineEditData!, { category: category.category, group: group.name, name: test.name })}
                                                                            className="text-teal-600 hover:bg-teal-50 p-0.5 rounded-md"
                                                                            title="حفظ"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setInlineEditingKey(null); setInlineEditData(null); }}
                                                                            className="text-red-400 hover:bg-red-50 p-0.5 rounded-md"
                                                                            title="إلغاء"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-0.5">
                                                                        <button
                                                                            onClick={() => {
                                                                                setInlineEditingKey(getInlineKey(category.category, group.name, test.name));
                                                                                setInlineEditData({ ...test });
                                                                            }}
                                                                            className="text-gray-400 hover:text-teal-600 p-1 rounded-md hover:bg-gray-100"
                                                                            title="تعديل سريع"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setModalConfig({ mode: 'edit', initialData: { category: category.category, group: group.name, test } })}
                                                                            className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100"
                                                                            title="تعديل متقدم"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteTest(category.category, group.name, test.name)}
                                                                            className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-gray-100"
                                                                            title="حذف الفحص"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-400">لا يوجد نتائج تطابق بحثك...</h3>
                    <p className="text-gray-300 mt-1 font-bold text-sm">جرب كلمات بحث مختلفة أو اختر قسماً آخر</p>
                </div>
            )}
        </div>
    );
};

export default TestsPage;
