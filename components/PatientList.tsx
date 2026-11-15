
import React, { useState, useMemo } from 'react';
import { Patient, Gender } from '../types';
import ViewSwitcher from './ViewSwitcher';

interface PatientListProps {
    patients: Patient[];
    addPatient: (patient: Omit<Patient, 'id' | 'registrationDate'>) => Promise<Patient>;
    updatePatient: (patient: Patient) => void;
    deletePatient: (id: number) => void;
    openOrderModal: (patientId: number) => void;
}

const PatientForm: React.FC<{
    onClose: () => void;
    onSubmit: (patient: Omit<Patient, 'id' | 'registrationDate'> | Patient) => void;
    openOrderModal: (patientId: number) => void;
    initialData?: Patient;
}> = ({ onClose, onSubmit, openOrderModal, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [dob, setDob] = useState(initialData?.dob || '');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>(initialData?.gender || Gender.Male);
    const [phone, setPhone] = useState(initialData?.phone || '');

    React.useEffect(() => {
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let ageNum = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                ageNum--;
            }
            setAge(ageNum >= 0 ? ageNum.toString() : '');
        }
    }, [dob]);

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDob = e.target.value;
        setDob(newDob);
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAge = e.target.value;
         if (/^\d*$/.test(newAge) && newAge.length <= 3) {
            setAge(newAge);
            if (newAge) {
                const ageNum = parseInt(newAge, 10);
                if (!isNaN(ageNum) && ageNum >= 0) {
                    const today = new Date();
                    const birthYear = today.getFullYear() - ageNum;
                    const month = (today.getMonth() + 1).toString().padStart(2, '0');
                    const day = today.getDate().toString().padStart(2, '0');
                    setDob(`${birthYear}-${month}-${day}`);
                }
            }
        }
    };

    const [submitAction, setSubmitAction] = useState<'save' | 'saveAndOrder'>('save');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (initialData) {
                await (onSubmit as any)({ ...initialData, name, dob, gender, phone });
                onClose();
            } else {
                const newPatient = await (onSubmit as any)({ name, dob, gender, phone });
                onClose();
                if (submitAction === 'saveAndOrder' && newPatient && newPatient.id) {
                    openOrderModal(newPatient.id);
                }
            }
        } catch (error) {
            console.error("Error saving patient:", error);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-bg-fade-in">
            <div className="bg-white p-3 rounded-xl shadow-2xl w-full max-w-[280px] animate-modal-enter">
                <h2 className="text-sm font-bold text-gray-800 mb-2 text-center">
                    {initialData ? 'تعديل بيانات مريض' : 'إضافة مريض جديد'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-[9px] font-bold text-gray-600 mb-0.5">الاسم الكامل</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-[10px] font-semibold" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-600 mb-0.5">العمر (سنوات)</label>
                                <input type="text" value={age} onChange={handleAgeChange} className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-[10px] font-semibold"/>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-600 mb-0.5">تاريخ الميلاد</label>
                                <input type="date" value={dob} onChange={handleDobChange} className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-[10px] font-semibold" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-gray-600 mb-0.5">الجنس</label>
                            <select value={gender} onChange={e => setGender(e.target.value as Gender)} className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-[10px] font-semibold">
                                <option value={Gender.Male}>ذكر</option>
                                <option value={Gender.Female}>أنثى</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-600 mb-0.5">رقم الهاتف</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-[10px] font-semibold" required />
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1 mt-3 pt-2 border-t">
                        <button type="button" onClick={onClose} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all active:scale-95 text-[9px]">إلغاء</button>
                        <button type="submit" onClick={() => setSubmitAction('save')} className="px-2 py-1 bg-white text-teal-600 border border-teal-500 rounded-lg font-bold hover:bg-teal-50 transition-all active:scale-95 text-[9px]">حفظ</button>
                        {!initialData && (
                            <button type="submit" onClick={() => setSubmitAction('saveAndOrder')} className="px-2 py-1 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-md transition-all active:scale-95 text-[9px]">حفظ وطلب فحص</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const PatientList: React.FC<PatientListProps> = ({ patients, addPatient, updatePatient, deletePatient, openOrderModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
    const [ageFilter, setAgeFilter] = useState<'all' | 'child' | 'adult'>('all');
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
    const [patientToDelete, setPatientToDelete] = useState<number | null>(null);

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredPatients = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        return patients.filter(p => {
            // Search & Generic Filters
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 p.phone.includes(searchTerm);
            const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
            
            const age = calculateAge(p.dob);
            const matchesAge = ageFilter === 'all' || 
                              (ageFilter === 'child' && age < 12) || 
                              (ageFilter === 'adult' && age >= 12);

            // Period Filter
            let matchesPeriod = true;
            if (period === 'today') matchesPeriod = p.registrationDate === todayStr;
            else if (period !== 'all') {
                const regDate = new Date(p.registrationDate);
                const diffDays = Math.ceil(Math.abs(now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
                if (period === 'week') matchesPeriod = diffDays <= 7;
                else if (period === 'month') matchesPeriod = diffDays <= 30;
            }

            return matchesSearch && matchesGender && matchesAge && matchesPeriod;
        });
    }, [patients, searchTerm, genderFilter, ageFilter, period]);

    const handleEdit = (p: Patient) => {
        setEditingPatient(p);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPatient(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            {isModalOpen && (
                <PatientForm 
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={editingPatient ? (p: any) => updatePatient(p) : (p) => addPatient(p)} 
                    openOrderModal={openOrderModal} 
                    initialData={editingPatient}
                />
            )}
            {patientToDelete !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-bg-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-[320px] animate-modal-enter text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
                        <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من حذف هذا المريض؟ سيتم حذف كافة الفحوصات المرتبطة به أيضاً.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPatientToDelete(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={() => {
                                    if (patientToDelete !== null) {
                                        deletePatient(Number(patientToDelete));
                                        setPatientToDelete(null);
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-all active:scale-95"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-gray-800">قائمة المرضى</h3>
                        <button 
                            onClick={handleAdd}
                            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-md transition-all active:scale-95 text-xs flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            إضافة مريض
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
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
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div className="md:col-span-2 relative">
                         <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input type="text" placeholder="بحث بالاسم أو رقم الهاتف..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-1.5 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold text-xs"/>
                    </div>
                    
                    <select
                        value={genderFilter}
                        onChange={e => setGenderFilter(e.target.value as any)}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 font-bold text-[10px] text-gray-600"
                    >
                        <option value="all">كلا الجنسين</option>
                        <option value={Gender.Male}>ذكر</option>
                        <option value={Gender.Female}>أنثى</option>
                    </select>

                    <select
                        value={ageFilter}
                        onChange={e => setAgeFilter(e.target.value as any)}
                        className="p-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 font-bold text-[10px] text-gray-600"
                    >
                        <option value="all">جميع الأعمار</option>
                        <option value="child">أطفال (&lt; 12)</option>
                        <option value="adult">بالغين (&ge; 12)</option>
                    </select>
                </div>
            </div>

            <div className="mt-4">
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-50">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100">
                                    <th className="p-3 font-black text-gray-500 uppercase text-[10px] tracking-widest">الاسم</th>
                                    <th className="p-3 font-black text-gray-500 uppercase text-[10px] tracking-widest w-[160px]">تاريخ الميلاد</th>
                                    <th className="p-3 font-black text-gray-500 uppercase text-[10px] tracking-widest text-center">الجنس</th>
                                    <th className="p-3 font-black text-gray-500 uppercase text-[10px] tracking-widest w-[160px]">رقم الهاتف</th>
                                    <th className="p-3 font-black text-gray-500 uppercase text-[10px] tracking-widest text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPatients.length > 0 ? filteredPatients.map((patient, index) => (
                                    <tr key={patient.id} className="hover:bg-teal-50/50 transition-colors animate-fade-in opacity-0" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="p-3 text-gray-800 font-bold text-sm">{patient.name}</td>
                                        <td className="p-3 text-gray-700 font-bold text-xs w-[160px]">{patient.dob}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${patient.gender === Gender.Male ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                                                {patient.gender}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500 font-mono text-[13px] w-[160px]">{patient.phone}</td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openOrderModal(patient.id)}
                                                    className="p-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all"
                                                    title="طلب فحص"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(patient)}
                                                    className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all"
                                                    title="تعديل"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => setPatientToDelete(patient.id)}
                                                    className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all"
                                                    title="حذف"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400 font-bold text-sm">لا يوجد مرضى يطابقون خيارات البحث</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPatients.map((patient, index) => (
                            <div key={patient.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:border-teal-200 hover:bg-white transition-all animate-fade-in opacity-0" style={{ animationDelay: `${index * 30}ms` }}>
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-base text-gray-800">{patient.name}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(patient)} className="text-blue-600 hover:text-blue-800"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                            <button onClick={() => setPatientToDelete(patient.id)} className="text-red-600 hover:text-red-800"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-0.5">
                                        <p className="text-[10px] text-gray-500"><strong className="font-semibold">العمر:</strong> {calculateAge(patient.dob)} سنة</p>
                                        <p className="text-[10px] text-gray-500"><strong className="font-semibold">الجنس:</strong> {patient.gender}</p>
                                        <p className="text-[10px] text-gray-500"><strong className="font-semibold">الهاتف:</strong> {patient.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openOrderModal(patient.id)}
                                    className="mt-3 w-full px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    طلب فحص
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;
