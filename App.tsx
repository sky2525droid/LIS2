import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import OrderList from './components/OrderList';
import Header from './components/Header';
import TestsPage from './components/TestsPage';
import SettingsPage from './components/SettingsPage';
import SampleCollectionPage from './components/SampleCollectionPage';
import ResultsPage from './components/ResultsPage';
import QualityControlPage from './components/QualityControlPage';
import StatisticsPage from './components/StatisticsPage';
import WorkflowGallery from './components/WorkflowGallery';
import OrderForm from './components/OrderForm';
import FinancialReport from './components/FinancialReport';
import ReagentsPage from './components/ReagentsPage';
import { Patient, TestOrder, TestStatus, Page, Gender, TestCategory, HL7Settings, LabSettings, PaymentStatus, FavoriteGroup, Reagent } from './types';
import { testData as initialTestData } from './data/tests';

const App: React.FC = () => {
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [testData, setTestData] = useState<TestCategory[]>(initialTestData);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [orders, setOrders] = useState<TestOrder[]>([]);
    const [reagents, setReagents] = useState<Reagent[]>([]);
    
    const [hl7Settings, setHl7Settings] = useState<HL7Settings>({
        enabled: false,
        ipAddress: '192.168.1.100',
        port: 5000
    });
    const [labSettings, setLabSettings] = useState<LabSettings>({
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
    });
    const [favoriteGroups, setFavoriteGroups] = useState<FavoriteGroup[]>([]);
    const [orderModalState, setOrderModalState] = useState<{ isOpen: boolean; initialPatientId?: number }>({ isOpen: false });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const patientsQuery = query(collection(db, 'patients'), where('userId', '==', userId));
        const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as unknown as Patient));
            setPatients(data);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'patients'));

        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as unknown as TestOrder));
            setOrders(data);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'orders'));

        const testCategoriesQuery = query(collection(db, 'testCategories'), where('userId', '==', userId));
        const unsubscribeTestCategories = onSnapshot(testCategoriesQuery, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => doc.data() as TestCategory);
                setTestData(data);
            }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'testCategories'));

        const hl7SettingsDoc = doc(db, 'hl7Settings', userId);
        const unsubscribeHl7 = onSnapshot(hl7SettingsDoc, (docSnap) => {
            if (docSnap.exists()) {
                setHl7Settings(docSnap.data() as HL7Settings);
            }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'hl7Settings'));

        const labSettingsDoc = doc(db, 'labSettings', userId);
        const unsubscribeLabSettings = onSnapshot(labSettingsDoc, (docSnap) => {
            if (docSnap.exists()) {
                setLabSettings(docSnap.data() as LabSettings);
            }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'labSettings'));

        const favoriteGroupsQuery = query(collection(db, 'favoriteGroups'), where('userId', '==', userId));
        const unsubscribeFavoriteGroups = onSnapshot(favoriteGroupsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as FavoriteGroup));
            setFavoriteGroups(data);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'favoriteGroups'));

        const reagentsQuery = query(collection(db, 'reagents'), where('userId', '==', userId));
        const unsubscribeReagents = onSnapshot(reagentsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Reagent));
            setReagents(data);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'reagents'));

        return () => {
            unsubscribePatients();
            unsubscribeOrders();
            unsubscribeTestCategories();
            unsubscribeHl7();
            unsubscribeLabSettings();
            unsubscribeFavoriteGroups();
            unsubscribeReagents();
        };
    }, [isAuthReady, userId]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center h-screen bg-gray-100">جاري التحميل...</div>;
    }

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 font-sans" dir="rtl">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-teal-600 mb-6">نظام معلومات المختبرات الطبية</h1>
                    <p className="text-gray-600 mb-8">يرجى تسجيل الدخول للوصول إلى النظام</p>
                    <button
                        onClick={handleLogin}
                        className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                    >
                        تسجيل الدخول باستخدام Google
                    </button>
                </div>
            </div>
        );
    }

    const openOrderModal = (patientId?: number) => {
        setOrderModalState({ isOpen: true, initialPatientId: patientId });
    };

    const closeOrderModal = () => {
        setOrderModalState({ isOpen: false, initialPatientId: undefined });
    };

    const addPatient = async (patient: Omit<Patient, 'id' | 'registrationDate'>): Promise<Patient> => {
        const newId = Math.floor(10000 + Math.random() * 90000);
        const newPatient = { 
            ...patient, 
            id: newId, 
            registrationDate: new Date().toISOString().split('T')[0],
            userId
        };
        try {
            await setDoc(doc(db, 'patients', newId.toString()), newPatient);
            return newPatient as Patient;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'patients');
            throw error;
        }
    };

    const updatePatient = async (updatedPatient: Patient) => {
        try {
            await updateDoc(doc(db, 'patients', updatedPatient.id.toString()), { ...updatedPatient });
            
            // Update patient name in orders
            const patientOrders = orders.filter(o => o.patientId === updatedPatient.id);
            for (const order of patientOrders) {
                await updateDoc(doc(db, 'orders', order.id.toString()), { patientName: updatedPatient.name });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'patients');
        }
    };

    const deletePatient = async (id: number) => {
        if (!id) return;
        try {
            await deleteDoc(doc(db, 'patients', id.toString()));
            // Delete related orders
            const patientOrders = orders.filter(o => o.patientId === id);
            for (const order of patientOrders) {
                await deleteDoc(doc(db, 'orders', order.id.toString()));
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'patients');
        }
    };

    const addOrder = async (order: Omit<TestOrder, 'id' | 'patientName'>) => {
        const patient = patients.find(p => Number(p.id) === Number(order.patientId));
        if (patient) {
            const newId = Math.floor(Date.now() * 1000 + Math.random() * 1000);
            const newOrder = { ...order, id: newId, patientName: patient.name, userId };
            try {
                await setDoc(doc(db, 'orders', newId.toString()), newOrder);
            } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, 'orders');
            }
        }
    };
    
    const updateOrderStatus = async (orderId: number, status: TestStatus, result: string | null, isAutoApproved?: boolean, notes?: string) => {
        try {
            const updateData: any = { status, result };
            if (isAutoApproved !== undefined) {
                updateData.isAutoApproved = isAutoApproved;
            }
            if (notes !== undefined) {
                updateData.notes = notes;
            }
            await updateDoc(doc(db, 'orders', orderId.toString()), updateData);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'orders');
        }
    };

    const updateOrderPayment = async (orderId: number, additionalAmount: number) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const newPaidAmount = order.paidAmount + additionalAmount;
        const finalPrice = order.totalPrice - (order.discount || 0);
        let newPaymentStatus = order.paymentStatus;
        if (newPaidAmount >= finalPrice) {
            newPaymentStatus = PaymentStatus.Paid;
        } else if (newPaidAmount > 0) {
            newPaymentStatus = PaymentStatus.PartiallyPaid;
        }

        try {
            await updateDoc(doc(db, 'orders', orderId.toString()), {
                paidAmount: newPaidAmount,
                paymentStatus: newPaymentStatus
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'orders');
        }
    };

    const updateTestData = async (newData: TestCategory[]) => {
        try {
            // In a real app, you might want to sync each category as a separate document.
            // For simplicity, we'll just save them individually.
            const cleanData = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanData);
                } else if (obj !== null && typeof obj === 'object') {
                    return Object.fromEntries(
                        Object.entries(obj)
                            .filter(([_, v]) => v !== undefined)
                            .map(([k, v]) => [k, cleanData(v)])
                    );
                }
                return obj;
            };

            for (const category of newData) {
                const categoryId = category.category.replace(/\s+/g, '-').toLowerCase();
                const cleanedCategory = cleanData({ ...category, userId });
                await setDoc(doc(db, 'testCategories', categoryId), cleanedCategory);
            }
        } catch (error) {
            console.error("Error updating test data:", error);
            handleFirestoreError(error, OperationType.UPDATE, 'testCategories');
        }
    };
    
    const updateHl7Settings = async (settings: HL7Settings) => {
        try {
            await setDoc(doc(db, 'hl7Settings', userId), { ...settings, userId });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'hl7Settings');
        }
    };

    const updateLabSettings = async (settings: LabSettings) => {
        const oldUnitPrice = labSettings.unitPrice;
        const newUnitPrice = settings.unitPrice;
        
        try {
            await setDoc(doc(db, 'labSettings', userId), { ...settings, userId });

            if (oldUnitPrice !== newUnitPrice) {
                const updatedTestData = testData.map(category => ({
                    ...category,
                    groups: category.groups.map(group => {
                        const updatedTests = group.tests.map(test => {
                            if (test.units !== undefined) {
                                return { ...test, price: test.units * newUnitPrice };
                            }
                            return test;
                        });
                        
                        const totalUnits = updatedTests.reduce((sum, t) => sum + (t.units || 0), 0);
                        const totalPrice = updatedTests.reduce((sum, t) => sum + (t.price || 0), 0);
                        
                        const updatedGroup: any = {
                            ...group,
                            tests: updatedTests
                        };
                        if (totalUnits > 0) {
                            updatedGroup.units = totalUnits;
                        }
                        if (totalPrice > 0) {
                            updatedGroup.price = totalPrice;
                        }
                        return updatedGroup;
                    })
                }));
                await updateTestData(updatedTestData);
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'labSettings');
        }
    };

    const addFavoriteGroup = async (group: Omit<FavoriteGroup, 'id'>) => {
        const newId = Date.now().toString();
        try {
            await setDoc(doc(db, 'favoriteGroups', newId), { ...group, id: newId, userId });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'favoriteGroups');
        }
    };

    const updateFavoriteGroup = async (group: FavoriteGroup) => {
        try {
            await updateDoc(doc(db, 'favoriteGroups', group.id), { ...group });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'favoriteGroups');
        }
    };

    const deleteFavoriteGroup = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'favoriteGroups', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'favoriteGroups');
        }
    };

    const addReagent = async (reagent: Omit<Reagent, 'id' | 'lastUpdated'>) => {
        const newId = Date.now().toString();
        const newReagent = { ...reagent, id: newId, lastUpdated: new Date().toISOString(), userId };
        try {
            await setDoc(doc(db, 'reagents', newId), newReagent);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'reagents');
        }
    };

    const updateReagent = async (reagent: Reagent) => {
        try {
            await updateDoc(doc(db, 'reagents', reagent.id), { ...reagent, lastUpdated: new Date().toISOString() });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'reagents');
        }
    };

    const deleteReagent = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'reagents', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'reagents');
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard orders={orders} patientsCount={patients.length} setCurrentPage={setCurrentPage} />;
            case 'patients':
                return <PatientList 
                    patients={patients} 
                    addPatient={addPatient} 
                    updatePatient={updatePatient}
                    deletePatient={deletePatient}
                    openOrderModal={openOrderModal} 
                />;
            case 'sampleCollection':
                return <SampleCollectionPage orders={orders} testData={testData} updateOrderStatus={updateOrderStatus} />;
            case 'results':
                return <ResultsPage orders={orders} updateOrderStatus={updateOrderStatus} />;
            case 'qualityControl':
                return <QualityControlPage orders={orders} updateOrderStatus={updateOrderStatus} labSettings={labSettings} />;
            case 'orders':
                return <OrderList allOrders={orders} openOrderModal={openOrderModal} updateOrderStatus={updateOrderStatus} updateOrderPayment={updateOrderPayment} labSettings={labSettings} testData={testData} />;
            case 'tests':
                return <TestsPage testData={testData} updateTestData={updateTestData} labSettings={labSettings} />;
            case 'settings':
                return <SettingsPage 
                    hl7Settings={hl7Settings} 
                    labSettings={labSettings} 
                    onSaveHL7={updateHl7Settings} 
                    onSaveLab={updateLabSettings}
                    favoriteGroups={favoriteGroups}
                    onAddFavoriteGroup={addFavoriteGroup}
                    onUpdateFavoriteGroup={updateFavoriteGroup}
                    onDeleteFavoriteGroup={deleteFavoriteGroup}
                    testData={testData}
                />;
            case 'statistics':
                return <StatisticsPage orders={orders} testData={testData} patients={patients} />;
            case 'workflow':
                return <WorkflowGallery />;
            case 'financials':
                return <FinancialReport orders={orders} updateOrderPayment={updateOrderPayment} labSettings={labSettings} />;
            case 'reagents':
                return <ReagentsPage reagents={reagents} onAdd={addReagent} onUpdate={updateReagent} onDelete={deleteReagent} />;
            default:
                return <Dashboard orders={orders} patientsCount={patients.length} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans" dir="rtl">
            <div className="print:hidden">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="print:hidden">
                    <Header currentPage={currentPage} labSettings={labSettings} onLogout={handleLogout} />
                </div>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                    <div key={currentPage} className="animate-fade-in">
                        {renderPage()}
                    </div>
                </main>
            </div>
             {orderModalState.isOpen && (
                <OrderForm
                    patients={patients}
                    testData={testData}
                    onClose={closeOrderModal}
                    addOrder={addOrder}
                    initialPatientId={orderModalState.initialPatientId}
                    labSettings={labSettings}
                    favoriteGroups={favoriteGroups}
                />
            )}
        </div>
    );
};

export default App;
