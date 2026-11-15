import React, { useState, useMemo, useRef } from 'react';
import { TestOrder, TestStatus, TestCategory, TubeType } from '../types';
import ViewSwitcher from './ViewSwitcher';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

type PatientOrderGroup = {
    patientName: string;
    patientId: number;
    orders: TestOrder[];
};


// Helper to get tube color
const getTubeColor = (tubeType: TubeType) => {
    switch (tubeType) {
        case TubeType.EDTA: return 'bg-purple-500';
        case TubeType.Serum: return 'bg-red-500';
        case TubeType.Citrate: return 'bg-blue-400';
        case TubeType.Urine: return 'bg-yellow-400';
        default: return 'bg-gray-400';
    }
};

const ConfirmationModal: React.FC<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-bg-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-modal-enter">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{message}</h3>
                <div className="flex justify-center gap-3 mt-6">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-600 transition">
                        إلغاء
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold transition">
                        نعم، تأكيد
                    </button>
                </div>
            </div>
        </div>
    );
};

const LabelPreviewModal: React.FC<{
    patientData: PatientOrderGroup;
    allTests: Map<string, { tubeType?: TubeType }>;
    requiredTubes: TubeType[];
    onClose: () => void;
}> = ({ patientData, allTests, requiredTubes, onClose }) => {
    
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Labels_${patientData.patientId}`,
        onAfterPrint: () => onClose(),
    });

    // Fix: Using type assertion on initial value to avoid untyped function call error.
    const testsByTube = requiredTubes.reduce((acc, tube) => {
        acc[tube] = patientData.orders
            .filter(order => (allTests.get(order.testName)?.tubeType) === tube)
            .map(order => order.testName);
        return acc;
    }, {} as Record<string, string[]>);

    const collectionTime = new Date().toLocaleString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-bg-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-modal-enter">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">معاينة ملصقات العينات</h2>
                    <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div ref={printRef} className="print-container">
                        <style type="text/css" media="print">
                            {`
                                @page { size: 50mm 25mm; margin: 0; }
                                body { margin: 0; padding: 0; }
                                .print-container { width: 100%; display: flex; flex-direction: column; gap: 0; }
                                .label-page { 
                                    width: 50mm; 
                                    height: 25mm; 
                                    page-break-after: always; 
                                    display: flex; 
                                    flex-direction: column; 
                                    justify-content: center; 
                                    align-items: center; 
                                    padding: 2mm; 
                                    box-sizing: border-box; 
                                    overflow: hidden;
                                    background: white;
                                }
                                .no-print { display: none !important; }
                            `}
                        </style>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block print:w-full">
                            {/* Fix: Explicitly type entries to ensure 'tests' is recognized as string[] for .join() */}
                            {(Object.entries(testsByTube) as [string, string[]][]).map(([tube, tests]) => (
                                <div key={tube} className="label-page bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 print:border-none print:bg-white print:p-1 print:space-y-0.5">
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 print:text-[10px] print:leading-tight">{patientData.patientName}</p>
                                            <p className="text-xs text-gray-500 print:text-[8px] print:leading-tight">ID: {patientData.patientId}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border text-xs print:border-none print:p-0">
                                            <span className={`w-2.5 h-2.5 rounded-full ${getTubeColor(tube as TubeType)} print:hidden`}></span>
                                            <span className="font-bold text-gray-600 print:text-[8px] print:text-black">{tube}</span>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <p className="text-xs font-semibold text-gray-700 print:text-[7px] print:leading-tight truncate">{tests.join(', ')}</p>
                                    </div>
                                    <div className="w-full flex justify-center">
                                        <Barcode value={`${patientData.patientId}-${tube.substring(0,3)}`} width={1} height={25} fontSize={10} margin={0} displayValue={true} />
                                    </div>
                                    <p className="text-center text-[10px] text-gray-400 font-semibold print:text-[6px] print:text-black">{collectionTime}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-600 transition">إغلاق</button>
                    <button onClick={handlePrint} className="flex-[2] px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg font-bold transition">
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    );
};


interface SampleCollectionPageProps {
    orders: TestOrder[];
    testData: TestCategory[];
    updateOrderStatus: (orderId: number, status: TestStatus, result: string | null) => void;
}

const SampleCollectionPage: React.FC<SampleCollectionPageProps> = ({ orders, testData, updateOrderStatus }) => {
    const [labelPreviewData, setLabelPreviewData] = useState<PatientOrderGroup | null>(null);
    const [confirmationData, setConfirmationData] = useState<TestOrder[] | null>(null);
    const [printConfirmationData, setPrintConfirmationData] = useState<PatientOrderGroup | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const filteredOrdersByPeriod = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return orders.filter(o => {
            if (period === 'today') return o.orderDate === todayStr;
            if (period === 'all') return true;
            
            const orderDate = new Date(o.orderDate);
            const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (period === 'week') return diffDays <= 7;
            if (period === 'month') return diffDays <= 30;
            return true;
        });
    }, [orders, period]);

    const ordersForCollectionByPatient = useMemo(() => {
        return filteredOrdersByPeriod
            .filter(order => order.status === TestStatus.Pending || order.status === TestStatus.SampleCollected)
            .reduce((acc, order) => {
                if (!acc[order.patientId]) {
                    acc[order.patientId] = {
                        patientName: order.patientName,
                        patientId: order.patientId,
                        orders: []
                    };
                }
                acc[order.patientId].orders.push(order);
                return acc;
            }, {} as Record<number, PatientOrderGroup>);
    }, [filteredOrdersByPeriod]);

    const filteredPatientGroups: PatientOrderGroup[] = (Object.values(ordersForCollectionByPatient) as PatientOrderGroup[]).filter(group => {
        const matchesSearch = group.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || group.orders.some(o => o.status === statusFilter);
        return matchesSearch && matchesStatus;
    });

    const allTests = useMemo(() => {
        const testsMap = new Map<string, { tubeType?: TubeType }>();
        testData.forEach(category => {
            category.groups.forEach(group => {
                group.tests.forEach(test => {
                    const tubeType = test.tubeType || group.tubeType;
                    const key = test.abbreviation || test.name;
                    testsMap.set(key, { tubeType });
                });
            });
        });
        return testsMap;
    }, [testData]);
    
    const getRequiredTubes = (patientOrders: TestOrder[]) => {
        const tubes = new Set<TubeType>();
        patientOrders.forEach(order => {
            const testInfo = allTests.get(order.testName);
            if (testInfo?.tubeType) {
                tubes.add(testInfo.tubeType);
            }
        });
        return Array.from(tubes);
    };

    const handleMarkAsCollected = (patientOrders: TestOrder[]) => {
        patientOrders.forEach(order => {
            updateOrderStatus(order.id, TestStatus.SampleCollected, null);
        });
    };
    
    return (
        <div className="space-y-6">
            {labelPreviewData && (
                 <LabelPreviewModal 
                    patientData={labelPreviewData}
                    allTests={allTests}
                    requiredTubes={getRequiredTubes(labelPreviewData.orders)}
                    onClose={() => setLabelPreviewData(null)}
                />
            )}
             {confirmationData && (
                <ConfirmationModal
                    message="هل أنت متأكد من سحب العينات لهذا المريض؟"
                    onConfirm={() => {
                        handleMarkAsCollected(confirmationData);
                        setConfirmationData(null);
                    }}
                    onCancel={() => setConfirmationData(null)}
                />
            )}
            {printConfirmationData && (
                <ConfirmationModal
                    message="هل أنت متأكد من تجهيز الملصقات للطباعة؟"
                    onConfirm={() => {
                        setLabelPreviewData(printConfirmationData);
                        setPrintConfirmationData(null);
                    }}
                    onCancel={() => setPrintConfirmationData(null)}
                />
            )}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h3 className="text-lg font-black text-gray-800">قائمة سحب العينات</h3>
                    <p className="text-gray-400 font-bold text-[10px] mt-0.5">عرض الطلبات المعلقة والتي تم سحب عيناتها.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <div className="flex bg-gray-100 p-1 rounded-lg whitespace-nowrap">
                        {(['today', 'week', 'month', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                                    period === p ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-100/50'
                                }`}
                            >
                                {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                            </button>
                        ))}
                    </div>
                    <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                    <div className="relative min-w-[150px]">
                        <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="ابحث باسم المريض..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-1.5 pr-8 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 font-bold text-xs"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="p-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 font-bold text-[10px] text-gray-600"
                    >
                        <option value="all">كل الحالات</option>
                        <option value={TestStatus.Pending}>معلق (بانتظار السحب)</option>
                        <option value={TestStatus.SampleCollected}>تم سحب العينة</option>
                    </select>
                </div>
            </div>

            {Object.keys(ordersForCollectionByPatient).length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-400">لا توجد طلبات لسحب العينات</h3>
                </div>
            ) : filteredPatientGroups.length === 0 ? (
                 <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-400">لا يوجد مرضى يطابقون بحثك</h3>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPatientGroups.map((patientGroup) => {
                        const requiredTubes = getRequiredTubes(patientGroup.orders);
                        const isCollected = patientGroup.orders.every(o => o.status === TestStatus.SampleCollected);
                        
                        return (
                            <div key={patientGroup.patientId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="p-5 bg-gray-50/70 border-b flex justify-between items-center">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800">{patientGroup.patientName}</h4>
                                        <p className="text-[10px] font-black text-gray-400">ID: {String(patientGroup.patientId).padStart(5, '0').slice(-5)}</p>
                                    </div>
                                    {isCollected && (
                                        <span className="px-3 py-1 text-[10px] font-black rounded-full bg-green-100 text-green-700 flex items-center gap-1.5 border border-green-200">
                                            تم السحب
                                        </span>
                                    )}
                                </div>
                                <div className="p-5 flex-1 space-y-4">
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">الفحوصات المطلوبة</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {patientGroup.orders.map(o => (
                                                <span key={o.id} className="bg-gray-100 text-gray-700 text-[10px] font-black px-2.5 py-1 rounded-md">{o.testName}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">الأنابيب اللازمة</h5>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {requiredTubes.map(tube => (
                                                <div key={tube} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${getTubeColor(tube)}`}></span>
                                                    <span className="text-[10px] font-black text-gray-600">{tube}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/70 border-t flex gap-3">
                                    <button 
                                        onClick={() => setPrintConfirmationData(patientGroup)} 
                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-black hover:bg-gray-100 transition text-xs"
                                    >
                                        طباعة
                                    </button>
                                    <button 
                                        onClick={() => setConfirmationData(patientGroup.orders)} 
                                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-black hover:bg-teal-700 transition text-xs shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={isCollected}
                                    >
                                        {isCollected ? 'تم السحب' : 'تأكيد السحب'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-right">المريض</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-right">الفحوصات</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الأنابيب</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-center">الحالة</th>
                                <th className="p-4 font-black text-gray-500 uppercase text-xs tracking-widest text-left pl-6">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPatientGroups.map((patientGroup) => {
                                const requiredTubes = getRequiredTubes(patientGroup.orders);
                                const isCollected = patientGroup.orders.every(o => o.status === TestStatus.SampleCollected);
                                return (
                                <tr key={patientGroup.patientId} className="hover:bg-teal-50/30 transition">
                                    <td className="p-4 font-bold text-gray-800 text-sm align-middle">{patientGroup.patientName}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-wrap gap-1">
                                            {patientGroup.orders.map(o => (
                                                <span key={o.id} className="bg-gray-100 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-gray-200">{o.testName}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle w-[55px]">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {requiredTubes.map(tube => (
                                                <div key={tube} className={`w-3 h-3 rounded-full ${getTubeColor(tube)} ring-2 ring-white shadow-sm`} title={tube}></div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                         {isCollected ? (
                                            <span className="px-3 py-1 text-[13px] font-black rounded-full bg-green-100 text-green-700 border border-green-200">
                                                تم السحب
                                            </span>
                                         ) : (
                                            <span className="px-3 py-1 text-[13px] font-black rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                بانتظار السحب
                                            </span>
                                         )}
                                    </td>
                                    <td className="p-4 text-left pl-6 align-middle">
                                         <div className="flex gap-2 justify-end">
                                            <button onClick={() => setPrintConfirmationData(patientGroup)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-black hover:bg-gray-100 transition text-[10px] shadow-sm">طباعة</button>
                                            <button 
                                                onClick={() => setConfirmationData(patientGroup.orders)} 
                                                className={`px-3 py-1.5 rounded-lg font-black transition text-[10px] shadow-sm ${isCollected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                                                disabled={isCollected}
                                            >
                                                تأكيد
                                            </button>
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

export default SampleCollectionPage;