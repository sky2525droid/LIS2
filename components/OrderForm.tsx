import React, { useState, useMemo, useEffect } from 'react';
import { Patient, TestStatus, TestCategory, TestGroup, TestOrder, Gender, PaymentStatus, LabSettings, FavoriteGroup } from '../types';

const TestSelectorModal: React.FC<{
    testData: TestCategory[];
    onClose: () => void;
    selectedTests: string[];
    setSelectedTests: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ testData, onClose, selectedTests, setSelectedTests }) => {

    const handleTestChange = (testName: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedTests(prev => Array.from(new Set([...prev, testName])));
        } else {
            setSelectedTests(prev => prev.filter(t => t !== testName));
        }
    };

    const toggleGroup = (group: TestGroup) => {
        const groupTestNames = group.tests.map(t => t.name);
        const allInGroupSelected = groupTestNames.every(name => selectedTests.includes(name));

        if (allInGroupSelected) {
            setSelectedTests(prev => prev.filter(t => !groupTestNames.includes(t)));
        } else {
            setSelectedTests(prev => Array.from(new Set([...prev, ...groupTestNames])));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 animate-bg-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-modal-enter">
                <div className="p-4 bg-teal-600 text-white flex justify-between items-center">
                    <h2 className="text-lg font-bold">اختيار الفحوصات الطبية</h2>
                    <div className="flex items-center gap-3">
                         <span className="bg-white/20 px-3 py-0.5 rounded-full text-[14px] font-bold">تم اختيار: {selectedTests.length}</span>
                         <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                         </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testData.map((categoryData) => (
                            <div key={categoryData.category} className="space-y-3">
                                <h3 className="text-sm font-black text-teal-800 border-b border-teal-100 pb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a4 4 0 00-5.656 0l-2.829 2.829a4 4 0 01-5.656-5.656l2.828-2.829a4 4 0 000-5.656l-1.414-1.414a2 2 0 00-2.828 0L4 8.586a2 2 0 000 2.828l10 10a2 2 0 002.828 0l1.414-1.414a4 4 0 000-5.656zM15 5h5m-5 5h5m-5 5h5"/></svg>
                                    {categoryData.category}
                                </h3>
                                {categoryData.groups.map(group => {
                                    const allInGroupSelected = group.tests.map(t => t.name).every(name => selectedTests.includes(name));
                                    return (
                                        <div key={group.name} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-gray-800 text-xs">{group.name}</h4>
                                                <button 
                                                    onClick={() => toggleGroup(group)}
                                                    className={`text-[9px] font-bold px-2 py-0.5 rounded transition ${allInGroupSelected ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                                >
                                                    {allInGroupSelected ? 'إلغاء الكل' : 'اختيار المجموعة'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {group.tests.map(test => (
                                                    <label key={test.name} className="flex items-center gap-2 p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer group transition">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition cursor-pointer"
                                                            checked={selectedTests.includes(test.name)}
                                                            onChange={(e) => handleTestChange(test.name, e.target.checked)}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-700 text-[18px] font-bold group-hover:text-teal-700">
                                                                {test.abbreviation || test.name}
                                                            </span>
                                                            <span className="text-[8px] text-gray-400 font-medium">({test.normalRange})</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md transition text-xs">تأكيد الاختيار</button>
                </div>
            </div>
        </div>
    );
};

const OrderForm: React.FC<{
    testData: TestCategory[];
    patients: Patient[];
    onClose: () => void;
    addOrder: (order: Omit<TestOrder, 'id' | 'patientName'>) => void;
    initialPatientId?: number;
    labSettings: LabSettings;
    favoriteGroups: FavoriteGroup[];
}> = ({ testData, patients, onClose, addOrder, initialPatientId, labSettings, favoriteGroups }) => {
    const [patientId, setPatientId] = useState<number | ''>(initialPatientId || '');
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [isTestSelectorOpen, setIsTestSelectorOpen] = useState(false);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [referringDoctor, setReferringDoctor] = useState<string>('');
    const [shortcutInput, setShortcutInput] = useState<string>('');
    
    const allTestsFlat = useMemo(() => testData.flatMap(c => c.groups.flatMap(g => g.tests)), [testData]);

    const totalPrice = useMemo(() => {
        let total = 0;
        const selectedSet = new Set(selectedTests);
        
        testData.forEach(category => {
            category.groups.forEach(group => {
                const groupTestNames = group.tests.map(t => t.name);
                const selectedInGroup = groupTestNames.filter(name => selectedSet.has(name));
                
                if (selectedInGroup.length === 0) return;

                // If all tests in the group are selected and the group has a price, use it
                if (group.price && selectedInGroup.length === group.tests.length) {
                    total += group.price;
                    selectedInGroup.forEach(name => selectedSet.delete(name));
                } else {
                    // Otherwise, sum individual prices
                    selectedInGroup.forEach(name => {
                        const test = group.tests.find(t => t.name === name);
                        if (test) {
                            if (test.units) {
                                total += test.units * labSettings.unitPrice;
                            } else if (test.price) {
                                total += test.price;
                            } else {
                                // Default price if none specified
                                total += 5000;
                            }
                        }
                        selectedSet.delete(name);
                    });
                }
            });
        });

        // Add any remaining tests not found in groups (fallback)
        selectedSet.forEach(name => {
            const test = allTestsFlat.find(t => t.name === name);
            if (test) {
                total += test.units ? (test.units * labSettings.unitPrice) : (test.price || 5000);
            }
        });

        return total;
    }, [selectedTests, testData, allTestsFlat, labSettings.unitPrice]);

    const finalPrice = useMemo(() => {
        const percentageDiscount = totalPrice * (discountPercentage / 100);
        return Math.max(0, totalPrice - discount - percentageDiscount);
    }, [totalPrice, discount, discountPercentage]);

    useEffect(() => {
        setPaidAmount(finalPrice);
    }, [finalPrice]);

    const displayItems = useMemo(() => {
        const items: { id: string; name: string; type: 'group' | 'test'; testNames: string[] }[] = [];
        let remaining = [...selectedTests];

        testData.forEach(cat => {
            cat.groups.forEach(group => {
                const groupTestNames = group.tests.map(t => t.name);
                const allSelected = groupTestNames.every(name => remaining.includes(name));
                
                if (allSelected && groupTestNames.length > 0) {
                    items.push({
                        id: `group-${group.name}`,
                        name: group.name,
                        type: 'group',
                        testNames: groupTestNames
                    });
                    remaining = remaining.filter(name => !groupTestNames.includes(name));
                }
            });
        });

        remaining.forEach(testName => {
            const test = allTestsFlat.find(t => t.name === testName);
            if (test) {
                items.push({
                    id: `test-${test.name}`,
                    name: test.abbreviation || test.name,
                    type: 'test',
                    testNames: [test.name]
                });
            }
        });

        return items;
    }, [selectedTests, testData, allTestsFlat]);

    const calculateNormalRange = (baseRange: string | undefined, patient: Patient) => {
        if (!baseRange) return '';
        
        const birthDate = new Date(patient.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const isChild = age < 12;
        const isMale = patient.gender === Gender.Male;

        if (baseRange.toLowerCase().includes('hgb') || baseRange.toLowerCase().includes('hemoglobin')) {
            if (isChild) return "11.0 - 14.5 g/dL (أطفال)";
            return isMale ? "13.8 - 17.2 g/dL (رجال)" : "12.1 - 15.1 g/dL (نساء)";
        }
        
        if (baseRange.toLowerCase().includes('creatinine')) {
            if (isChild) return "0.3 - 0.7 mg/dL (أطفال)";
            return isMale ? "0.7 - 1.3 mg/dL (رجال)" : "0.6 - 1.1 mg/dL (نساء)";
        }

        return baseRange;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const patient = patients.find(p => Number(p.id) === Number(patientId));
        if (patient && selectedTests.length > 0) {
            const selectedSet = new Set(selectedTests);
            const ordersToGenerate: any[] = []; // { testName, price, normalRange?, isProfile?, subTests? }

            testData.forEach(category => {
                category.groups.forEach(group => {
                    const groupTestNames = group.tests.map(t => t.name);
                    const selectedInGroup = groupTestNames.filter(name => selectedSet.has(name));
                    
                    if (selectedInGroup.length === 0) return;

                    if (selectedInGroup.length === group.tests.length && group.isProfile) {
                        const groupPrice = group.price || group.tests.reduce((acc, t) => acc + (t.units ? t.units * labSettings.unitPrice : (t.price || 5000)), 0);
                        ordersToGenerate.push({
                            testName: group.abbreviation || group.name,
                            price: groupPrice,
                            isProfile: true,
                            subTests: group.tests.map(t => ({
                                name: t.abbreviation || t.name,
                                normalRange: calculateNormalRange(t.normalRange, patient)
                            }))
                        });
                        selectedInGroup.forEach(name => selectedSet.delete(name));
                    } else if (selectedInGroup.length === group.tests.length && group.price) {
                        // Distribute group price evenly among tests
                        const pricePerTest = Math.round(group.price / selectedInGroup.length);
                        selectedInGroup.forEach(name => {
                            const test = group.tests.find(t => t.name === name);
                            if (test) {
                                ordersToGenerate.push({
                                    testName: test.abbreviation || test.name,
                                    price: pricePerTest,
                                    normalRange: calculateNormalRange(test.normalRange, patient)
                                });
                            }
                            selectedSet.delete(name);
                        });
                    } else {
                        // Individual prices
                        selectedInGroup.forEach(name => {
                            const test = group.tests.find(t => t.name === name);
                            if (test) {
                                const price = test.units ? (test.units * labSettings.unitPrice) : (test.price || 5000);
                                ordersToGenerate.push({
                                    testName: test.abbreviation || test.name,
                                    price: price,
                                    normalRange: calculateNormalRange(test.normalRange, patient)
                                });
                            }
                            selectedSet.delete(name);
                        });
                    }
                });
            });

            // Fallback for any remaining unmapped tests
            selectedSet.forEach(name => {
                const test = allTestsFlat.find(t => t.name === name);
                if (test) {
                    const price = test.units ? (test.units * labSettings.unitPrice) : (test.price || 5000);
                    ordersToGenerate.push({
                        testName: test.abbreviation || test.name,
                        price: price,
                        normalRange: calculateNormalRange(test.normalRange, patient)
                    });
                }
            });

            // Create actual orders
            ordersToGenerate.forEach((orderInfo) => {
                const testPrice = orderInfo.price;
                const totalDiscount = totalPrice - finalPrice;
                const testDiscount = totalPrice > 0 ? Math.round((testPrice / totalPrice) * totalDiscount) : 0;
                const testFinalPrice = testPrice - testDiscount;
                const testPaidAmount = totalPrice > 0 ? Math.round((testPrice / totalPrice) * paidAmount) : 0;
                
                let testPaymentStatus = PaymentStatus.Unpaid;
                if (testPaidAmount >= testFinalPrice) {
                    testPaymentStatus = PaymentStatus.Paid;
                } else if (testPaidAmount > 0) {
                    testPaymentStatus = PaymentStatus.PartiallyPaid;
                }

                const orderPayload: any = {
                    patientId: Number(patientId), 
                    testName: orderInfo.testName, 
                    orderDate: new Date().toISOString().split('T')[0], 
                    status: TestStatus.Pending, 
                    result: null,
                    totalPrice: testPrice,
                    discount: testDiscount,
                    paidAmount: testPaidAmount,
                    paymentStatus: testPaymentStatus
                };
                
                // conditional fields
                if (orderInfo.normalRange) orderPayload.normalRange = orderInfo.normalRange;
                if (orderInfo.isProfile) orderPayload.isProfile = orderInfo.isProfile;
                if (orderInfo.subTests) orderPayload.subTests = orderInfo.subTests;
                
                if (discountPercentage > 0) {
                    orderPayload.discountPercentage = discountPercentage;
                }
                if (referringDoctor) {
                    orderPayload.referringDoctor = referringDoctor;
                }

                addOrder(orderPayload);
            });
            onClose();
        }
    };

    return (
        <>
            {isTestSelectorOpen && (
                <TestSelectorModal 
                    testData={testData} 
                    selectedTests={selectedTests} 
                    setSelectedTests={setSelectedTests} 
                    onClose={() => setIsTestSelectorOpen(false)} 
                />
            )}
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-bg-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[298px] overflow-hidden animate-modal-enter">
                    <div className="bg-teal-600 p-2 text-white text-center">
                        <h2 className="text-base font-bold">طلب فحص جديد</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-3 space-y-2">
                        <div>
                            <label className="block text-[9px] font-bold text-gray-700 mb-0.5">اختر المريض</label>
                            <select 
                                value={patientId} 
                                onChange={e => setPatientId(Number(e.target.value))} 
                                className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-semibold text-[10px]" 
                                required
                            >
                                <option value="" disabled>-- ابحث عن مريض --</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-gray-700 mb-0.5">الطبيب المحيل (اختياري)</label>
                            <input 
                                type="text" 
                                value={referringDoctor}
                                onChange={e => setReferringDoctor(e.target.value)}
                                className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-semibold text-[10px]" 
                                placeholder="اسم الطبيب..."
                            />
                        </div>

                        {favoriteGroups.length > 0 && (
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-700">اختيار سريع من المفضلات</label>
                                <div className="flex flex-wrap gap-1">
                                    {favoriteGroups.map(group => (
                                        <button
                                            key={group.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTests(prev => Array.from(new Set([...prev, ...group.testNames])));
                                            }}
                                            className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-[8px] font-black hover:bg-teal-100 transition-colors"
                                        >
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] font-bold text-gray-700 mb-0.5">رقم الفحص (اضغط Enter للإضافة)</label>
                            <input 
                                type="text"
                                value={shortcutInput}
                                onChange={e => setShortcutInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (!shortcutInput.trim()) return;
                                        
                                        let foundTestNames: string[] = [];
                                        const query = shortcutInput.trim();
                                        
                                        for (const cat of testData) {
                                            for (const group of cat.groups) {
                                                if (group.shortcut && group.shortcut === query) {
                                                    foundTestNames = group.tests.map(t => t.name);
                                                    break;
                                                }
                                                const test = group.tests.find(t => t.shortcut && t.shortcut === query);
                                                if (test) {
                                                    foundTestNames = [test.name];
                                                    break;
                                                }
                                            }
                                            if (foundTestNames.length > 0) break;
                                        }

                                        if (foundTestNames.length > 0) {
                                            setSelectedTests(prev => Array.from(new Set([...prev, ...foundTestNames])));
                                        }
                                        setShortcutInput('');
                                    }
                                }}
                                className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-bold text-[10px]" 
                                placeholder="أدخل رقم الفحص..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[9px] font-bold text-gray-700 mb-0.5">الفحوصات المحددة</label>
                            <div className="p-1.5 border border-gray-200 rounded-xl min-h-[50px] bg-gray-50 flex flex-wrap gap-1 content-start">
                                {selectedTests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 py-3">
                                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                                        <p className="text-[9px] font-medium">لم يتم تحديد أي فحص بعد</p>
                                    </div>
                                ) : (
                                    displayItems.map(item => (
                                        <div key={item.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border flex items-center gap-1 animate-fade-in ${item.type === 'group' ? 'bg-teal-600 text-white border-teal-700' : 'bg-teal-100 text-teal-800 border-teal-200'}`}>
                                            {item.name}
                                            <button 
                                                type="button" 
                                                onClick={() => setSelectedTests(prev => prev.filter(t => !item.testNames.includes(t)))}
                                                className="hover:opacity-70 transition-colors"
                                            >
                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsTestSelectorOpen(true)} 
                                className="w-full mt-1 px-2 py-1 bg-white border border-dashed border-teal-300 text-teal-600 rounded-lg font-bold hover:bg-teal-50 transition-all flex items-center justify-center gap-1 text-[9px]"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                استعراض واختيار التحاليل
                            </button>
                        </div>

                        <div className="bg-teal-50 p-2 rounded-xl border border-teal-100 space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-teal-800">إجمالي المبلغ:</span>
                                <span className="text-[14px] font-bold text-gray-500">{totalPrice.toLocaleString()} ل.س</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-[115px]">
                                    <label className="block text-[10px] font-bold text-teal-700 mb-0.5">المبلغ المدفوع</label>
                                    <input 
                                        type="number" 
                                        value={paidAmount}
                                        onChange={e => setPaidAmount(Number(e.target.value))}
                                        className="w-[94px] p-1.5 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white font-bold text-teal-700 text-[10px]"
                                        placeholder="0"
                                        min="0"
                                        max={finalPrice}
                                    />
                                </div>
                                <div className="w-[165px] space-y-1">
                                    <label className="block text-[10px] font-bold text-red-700 mb-0.5">الحسم (Discount)</label>
                                    <div className="flex gap-1">
                                        <div className="relative flex-1">
                                            <input 
                                                type="number" 
                                                value={discountPercentage}
                                                onChange={e => setDiscountPercentage(Number(e.target.value))}
                                                className="w-[52px] p-1.5 pl-5 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white font-bold text-red-700 text-[10px]"
                                                placeholder="%"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-red-400">%</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={discount}
                                            onChange={e => setDiscount(Number(e.target.value))}
                                            className="w-full flex-[1.5] p-1.5 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white font-bold text-red-700 text-[10px]"
                                            placeholder="مبلغ"
                                            min="0"
                                            max={totalPrice}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-teal-100">
                                <span className="text-[9px] font-bold text-teal-800">الصافي المطلوب:</span>
                                <span className="text-[16px] font-bold text-[#0d9488]">{finalPrice.toLocaleString()} ل.س</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">المتبقي:</span>
                                <span className="text-[10px] font-bold text-red-500">{(finalPrice - paidAmount).toLocaleString()} ل.س</span>
                            </div>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                             <button type="button" onClick={onClose} className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors text-[10px]">إلغاء</button>
                             <button 
                                type="submit" 
                                className="flex-[2] px-3 py-1.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md disabled:opacity-50 text-[10px] active:scale-95"
                                disabled={!patientId || selectedTests.length === 0}
                            >
                                إنشاء طلب التحليل
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default OrderForm;
