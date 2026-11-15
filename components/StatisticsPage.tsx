
import React, { useState, useMemo } from 'react';
import { TestOrder, TestCategory, TestStatus, Patient, Gender } from '../types';
import StatCard from './StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface StatisticsPageProps {
    orders: TestOrder[];
    testData: TestCategory[];
    patients: Patient[];
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ orders, testData, patients }) => {
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [exportingId, setExportingId] = useState<string | null>(null);

    const [commissions, setCommissions] = useState<Record<string, number>>({});

    // Helper to find price for a test
    const getTestPrice = (testName: string) => {
        for (const cat of testData) {
            for (const group of cat.groups) {
                const test = group.tests.find(t => t.name === testName || t.abbreviation === testName);
                if (test && test.price) return test.price;
                if (group.price) return group.price / group.tests.length; // Approximate if group price
            }
        }
        return 4000; // Default fallback price estimate if not found
    };

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        return orders.filter(o => {
            if (period === 'all') return true;
            if (period === 'today') return o.orderDate === todayStr;
            
            const orderDate = new Date(o.orderDate);
            const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (period === 'week') return diffDays <= 7;
            if (period === 'month') return diffDays <= 30;
            return true;
        });
    }, [orders, period]);

    const stats = useMemo(() => {
        const uniquePatients = new Set(filteredOrders.map(o => o.patientId)).size;
        const totalTests = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
        
        // Daily average for the selected period (approximation)
        let days = 1;
        if (period === 'week') days = 7;
        if (period === 'month') days = 30;
        if (period === 'all') {
             // Calculate days between first and last order
             if (filteredOrders.length > 0) {
                 const dates = filteredOrders.map(o => new Date(o.orderDate).getTime());
                 const min = Math.min(...dates);
                 const max = Math.max(...dates);
                 days = Math.max(1, Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1);
             }
        }

        const dailyAvg = Math.round(totalTests / days);

        return { uniquePatients, totalTests, totalRevenue, totalDiscount, dailyAvg };
    }, [filteredOrders, period]);

    // Data for Area Chart (Trend)
    const trendData = useMemo(() => {
        const data: Record<string, { date: string, tests: number, revenue: number }> = {};
        
        filteredOrders.forEach(o => {
            if (!data[o.orderDate]) {
                data[o.orderDate] = { date: o.orderDate, tests: 0, revenue: 0 };
            }
            data[o.orderDate].tests += 1;
            data[o.orderDate].revenue += (o.paidAmount || 0);
        });

        // Sort by date
        return Object.values(data).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredOrders]);

    // Data for Pie Chart (Status)
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredOrders.forEach(o => {
            const status = o.status === TestStatus.Approved || o.status === TestStatus.Delivered ? 'منجز' :
                           o.status === TestStatus.Pending ? 'معلق' : 'قيد العمل';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    // Data for Bar Chart (Top Tests)
    const topTestsData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredOrders.forEach(o => {
            counts[o.testName] = (counts[o.testName] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredOrders]);

    // Data for Demographics (Gender)
    const genderData = useMemo(() => {
        const patientIds = Array.from(new Set(filteredOrders.map(o => o.patientId)));
        const relevantPatients = patients.filter(p => patientIds.includes(p.id));
        const counts: Record<string, number> = {};
        
        relevantPatients.forEach(p => {
            counts[p.gender] = (counts[p.gender] || 0) + 1;
        });
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredOrders, patients]);

    // Data for Age Groups
    const ageGroupsData = useMemo(() => {
        const patientIds = Array.from(new Set(filteredOrders.map(o => o.patientId)));
        const relevantPatients = patients.filter(p => patientIds.includes(p.id));
        const groups = {
            'أطفال (0-12)': 0,
            'شباب (13-25)': 0,
            'بالغين (26-50)': 0,
            'كبار سن (50+)': 0
        };

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

        relevantPatients.forEach(p => {
            const age = calculateAge(p.dob);
            if (age <= 12) groups['أطفال (0-12)']++;
            else if (age <= 25) groups['شباب (13-25)']++;
            else if (age <= 50) groups['بالغين (26-50)']++;
            else groups['كبار سن (50+)']++;
        });

        return Object.entries(groups).map(([name, count]) => ({ name, count }));
    }, [filteredOrders, patients]);

    // Data for Revenue by Category
    const revenueByCategoryData = useMemo(() => {
        const catMap: Record<string, number> = {};
        
        filteredOrders.forEach(o => {
            // Find category for this test
            let category = 'أخرى';
            for (const cat of testData) {
                for (const group of cat.groups) {
                    if (group.tests.some(t => t.name === o.testName || t.abbreviation === o.testName)) {
                        category = cat.category;
                        break;
                    }
                }
                if (category !== 'أخرى') break;
            }
            catMap[category] = (catMap[category] || 0) + (o.totalPrice - (o.discount || 0));
        });

        return Object.entries(catMap)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredOrders, testData]);

    // Data for Referring Doctors
    const referringDoctorsData = useMemo(() => {
        const doctors: Record<string, { 
            name: string, 
            count: number, 
            totalAmount: number,
            patients: Record<number, { name: string, amount: number, testCount: number }>
        }> = {};

        filteredOrders.forEach(o => {
            if (o.referringDoctor) {
                if (!doctors[o.referringDoctor]) {
                    doctors[o.referringDoctor] = { 
                        name: o.referringDoctor, 
                        count: 0, 
                        totalAmount: 0,
                        patients: {}
                    };
                }
                doctors[o.referringDoctor].count += 1;
                const amount = (o.totalPrice - (o.discount || 0));
                doctors[o.referringDoctor].totalAmount += amount;

                if (!doctors[o.referringDoctor].patients[o.patientId]) {
                    doctors[o.referringDoctor].patients[o.patientId] = { name: o.patientName, amount: 0, testCount: 0 };
                }
                doctors[o.referringDoctor].patients[o.patientId].amount += amount;
                doctors[o.referringDoctor].patients[o.patientId].testCount += 1;
            }
        });

        return Object.values(doctors).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [filteredOrders]);

    // Data for Patient Statistics
    const patientStatsData = useMemo(() => {
        const stats: Record<number, { name: string, testCount: number, totalAmount: number }> = {};
        filteredOrders.forEach(o => {
            if (!stats[o.patientId]) {
                stats[o.patientId] = { name: o.patientName, testCount: 0, totalAmount: 0 };
            }
            stats[o.patientId].testCount += 1;
            stats[o.patientId].totalAmount += (o.totalPrice - (o.discount || 0));
        });
        return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [filteredOrders]);

    const handleExportPDF = (elementId: string = 'statistics-report', customFilename?: string) => {
        setExportingId(elementId);
        const element = document.getElementById(elementId);
        if (!element) {
            setExportingId(null);
            return;
        }
        
        const opt = {
            margin: [10, 10],
            filename: customFilename || `تقرير_الإحصائيات_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().set(opt).from(element).save().then(() => {
                setExportingId(null);
            });
        } else {
            console.error('html2pdf library not found');
            setExportingId(null);
            alert('عذراً، مكتبة تصدير PDF غير متوفرة حالياً.');
        }
    };

    const ExportButton = ({ targetId, filename, title }: { targetId: string, filename: string, title?: string }) => (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                handleExportPDF(targetId, filename);
            }}
            disabled={exportingId !== null}
            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all print:hidden"
            title={title || "تصدير هذا الجزء كـ PDF"}
        >
            {exportingId === targetId ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            )}
        </button>
    );

    const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6'];

    return (
        <div className="space-y-8" id="statistics-report">
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none">
                <div>
                    <h3 className="text-lg font-black text-gray-800">لوحة الإحصائيات والتقارير</h3>
                    <p className="text-gray-400 font-bold text-[10px] mt-0.5">نظرة شاملة على أداء المختبر والإيرادات المالية.</p>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <div className="flex bg-gray-100 p-1 rounded-lg print:hidden">
                        {(['today', 'week', 'month', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all ${
                                    period === p ? 'bg-white text-teal-600 shadow-sm border border-gray-100' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-100/50'
                                }`}
                            >
                                {p === 'today' ? 'اليوم' : p === 'week' ? 'هذا الأسبوع' : p === 'month' ? 'هذا الشهر' : 'الكل'}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => handleExportPDF('statistics-report')}
                        disabled={exportingId !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-[10px] font-black rounded-xl hover:bg-teal-700 transition-all shadow-md disabled:opacity-50 print:hidden"
                    >
                        {exportingId === 'statistics-report' ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        )}
                        تصدير التقرير الكامل
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div id="top-stats-summary" className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-black text-gray-800">ملخص الإحصائيات العامة</h4>
                    <ExportButton targetId="top-stats-summary" filename="ملخص_الإحصائيات.pdf" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase mb-1">إجمالي الإيرادات</p>
                            <h4 className="text-xl font-black text-teal-600">{stats.totalRevenue.toLocaleString()}</h4>
                        </div>
                        <div className="p-2 bg-teal-100/50 text-teal-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase mb-1">إجمالي الخصومات</p>
                            <h4 className="text-xl font-black text-red-500">{stats.totalDiscount.toLocaleString()}</h4>
                        </div>
                        <div className="p-2 bg-red-100/50 text-red-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase mb-1">عدد الفحوصات</p>
                            <h4 className="text-xl font-black text-blue-600">{stats.totalTests}</h4>
                        </div>
                        <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a4 4 0 00-5.656 0l-2.829 2.829a4 4 0 01-5.656-5.656l2.828-2.829a4 4 0 000-5.656l-1.414-1.414a2 2 0 00-2.828 0L4 8.586a2 2 0 000 2.828l10 10a2 2 0 002.828 0l1.414-1.414a4 4 0 000-5.656zM15 5h5m-5 5h5m-5 5h5"/></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase mb-1">عدد المرضى</p>
                            <h4 className="text-xl font-black text-purple-600">{stats.uniquePatients}</h4>
                        </div>
                        <div className="p-2 bg-purple-100/50 text-purple-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase mb-1">المعدل اليومي</p>
                            <h4 className="text-xl font-black text-orange-600">{stats.dailyAvg}</h4>
                        </div>
                        <div className="p-2 bg-orange-100/50 text-orange-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div id="trend-chart-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">النمو الزمني (الإيرادات وعدد الفحوصات)</h4>
                        <ExportButton targetId="trend-chart-section" filename="نمو_الإيرادات.pdf" />
                    </div>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                                <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="الإيرادات" stroke="#0d9488" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                                <Area yAxisId="right" type="monotone" dataKey="tests" name="عدد الفحوصات" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTests)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div id="status-pie-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">توزيع حالات الفحوصات</h4>
                        <ExportButton targetId="status-pie-section" filename="توزيع_الحالات.pdf" />
                    </div>
                    <div className="flex-1 flex items-center justify-center h-[300px]" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Demographics & Category Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Demographics Pie Chart */}
                 <div id="demographics-pie-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">التوزيع الجندري (مرتبطة بالفحوصات)</h4>
                        <ExportButton targetId="demographics-pie-section" filename="توزيع_الجنس.pdf" />
                    </div>
                    <div className="flex-1 flex items-center justify-center h-[250px]" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === Gender.Male ? '#3b82f6' : '#ec4899'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Age Groups Bar Chart */}
                <div id="age-groups-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">الفئات العمرية</h4>
                        <ExportButton targetId="age-groups-section" filename="الفئات_العمرية.pdf" />
                    </div>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageGroupsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" fontSize={11} tick={{ fontWeight: 'bold' }} />
                                <YAxis fontSize={12} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="count" name="عدد المرضى" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Category Bar Chart */}
                <div id="revenue-category-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">الإيرادات حسب التصنيف</h4>
                        <ExportButton targetId="revenue-category-section" filename="إيرادات_التصنيفات.pdf" />
                    </div>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByCategoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="revenue" name="إجمالي الإيرادات" fill="#f59e0b" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Tests Bar Chart and Referring Doctors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div id="top-tests-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">أكثر الفحوصات طلباً</h4>
                        <ExportButton targetId="top-tests-section" filename="الفحوصات_الأكثر_طلبا.pdf" />
                    </div>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topTestsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#4b5563' }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="count" name="عدد المرات" fill="#0d9488" radius={[0, 10, 10, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div id="referring-doctors-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-gray-800">الأطباء المحيلون وإحصائيات الإحالة والعمولات</h4>
                        <ExportButton targetId="referring-doctors-section" filename="إحصائيات_الأطباء.pdf" />
                    </div>
                    {referringDoctorsData.length > 0 ? (
                        <div className="overflow-y-auto max-h-[400px] space-y-4 pr-2 custom-scrollbar">
                            {referringDoctorsData.map((doc, index) => {
                                const commissionPercent = commissions[doc.name] || 0;
                                const commissionAmount = (doc.totalAmount * commissionPercent) / 100;
                                
                                return (
                                    <div key={doc.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-teal-50/30 transition-all space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center font-black">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800">{doc.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">طبيب محيل</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 text-right">
                                                <div>
                                                    <p className="text-lg font-black text-teal-600">{doc.count}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">إحالة</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-blue-600">{doc.totalAmount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">إجمالي المبلغ</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commission Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 print:hidden">
                                                <div className="flex-1">
                                                    <label className="block text-[9px] font-bold text-gray-500 mb-1">نسبة العمولة (%)</label>
                                                    <input 
                                                        type="number" 
                                                        value={commissionPercent || ''} 
                                                        onChange={(e) => setCommissions(prev => ({ ...prev, [doc.name]: Number(e.target.value) }))}
                                                        className="w-full p-1.5 border border-gray-100 rounded-lg text-xs font-bold focus:ring-2 focus:ring-teal-500"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-gray-500 mb-1">إجمالي العمولة</p>
                                                    <p className="text-sm font-black text-orange-600">{commissionAmount.toLocaleString()} <span className="text-[10px]">ل.س</span></p>
                                                </div>
                                            </div>
                                            
                                            {/* Print-only commission display */}
                                            <div className="hidden print:flex justify-between items-center p-2 bg-gray-100 rounded-lg border border-gray-200">
                                                <span className="text-[10px] font-black">العمولة المستحقة ({commissionPercent}%):</span>
                                                <span className="text-sm font-black text-orange-600">{commissionAmount.toLocaleString()} ل.س</span>
                                            </div>
                                        </div>

                                        {/* Patients List for this doctor */}
                                        <div className="bg-white/50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">تفاصيل المرضى المحالين:</p>
                                            <div className="space-y-2">
                                                {Object.values(doc.patients).map((patient: any, pIdx) => (
                                                    <div key={pIdx} className="flex justify-between items-center text-[11px] border-b border-gray-50 pb-1 last:border-0">
                                                        <span className="font-bold text-gray-700">{patient.name}</span>
                                                        <div className="flex gap-3">
                                                            <span className="text-gray-400">{patient.testCount} فحص</span>
                                                            <span className="font-black text-teal-600">{patient.amount.toLocaleString()} ل.س</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                            <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            <p className="font-bold">لا توجد بيانات أطباء حالياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Statistics Section */}
            <div id="patients-stats-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-black text-gray-800">إحصائيات المرضى (عدد التحاليل والمبالغ)</h4>
                    <ExportButton targetId="patients-stats-section" filename="إحصائيات_المرضى.pdf" />
                </div>
                {patientStatsData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase">
                                    <th className="p-2 rounded-r-2xl">اسم المريض</th>
                                    <th className="p-2 text-center">عدد التحاليل</th>
                                    <th className="p-2 text-center">إجمالي المبلغ (بعد الحسم)</th>
                                    <th className="p-2 rounded-l-2xl text-center">متوسط سعر التحليل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {patientStatsData.map((stat) => (
                                    <tr key={stat.name} className="hover:bg-teal-50/30 transition-colors group">
                                        <td className="p-2 text-[12px] leading-[12px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs">
                                                    {stat.name.charAt(0)}
                                                </div>
                                                <span className="font-black text-gray-800">{stat.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-center text-[12px] leading-[12px]">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black text-xs">
                                                {stat.testCount}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center text-[12px] leading-[12px]">
                                            <span className="font-black text-teal-600">
                                                {stat.totalAmount.toLocaleString()} <span className="text-[10px] text-gray-400">ل.س</span>
                                            </span>
                                        </td>
                                        <td className="p-2 text-center text-[12px] leading-[12px]">
                                            <span className="font-bold text-gray-500 text-xs">
                                                {Math.round(stat.totalAmount / stat.testCount).toLocaleString()} ل.س
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                        <p className="font-bold">لا توجد بيانات مرضى حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsPage;
