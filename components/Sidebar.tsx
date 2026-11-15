
import React from 'react';
import { Page } from '../types';
import { DashboardIcon, PatientIcon, OrderIcon, TestTubeIcon, SettingsIcon, CollectionIcon, ResultsIcon, QualityControlIcon, StatsIcon, MoneyIcon } from './icons/Icons';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { id: 'dashboard', label: 'الصفحة الرئيسية', icon: <DashboardIcon /> },
        { id: 'patients', label: 'المرضى', icon: <PatientIcon /> },
        { id: 'orders', label: 'طلبات الفحص', icon: <OrderIcon /> },
        { id: 'financials', label: 'التحصيل المالي', icon: <MoneyIcon /> },
        { id: 'sampleCollection', label: 'سحب العينات', icon: <CollectionIcon /> },
        { id: 'results', label: 'النتائج', icon: <ResultsIcon /> },
        { id: 'qualityControl', label: 'ضبط الجودة', icon: <QualityControlIcon /> },
        { id: 'statistics', label: 'الإحصائيات والتقارير', icon: <StatsIcon /> },
        { id: 'reagents', label: 'مستودع الكواشف', icon: <CollectionIcon /> },
        { id: 'workflow', label: 'دليل العمل (صور)', icon: <ResultsIcon /> },
        { id: 'tests', label: 'الفحوصات', icon: <TestTubeIcon /> },
        { id: 'settings', label: 'الإعدادات', icon: <SettingsIcon /> },
    ];

    return (
        <div className="w-56 bg-white text-gray-800 flex flex-col shadow-lg border-l-2 border-gray-100">
            <div className="h-16 flex items-center justify-center border-b-2 border-gray-100">
                <h1 className="text-xl font-black text-teal-600 tracking-tight">نظام المختبر</h1>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="mb-1">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item.id as Page);
                                }}
                                className={`flex items-center p-2.5 rounded-lg transition-all duration-200 ease-in-out transform active:scale-95 ${
                                    currentPage === item.id
                                        ? 'bg-teal-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-teal-50 hover:text-teal-600'
                                }`}
                            >
                                <span className="mr-2 scale-90">{item.icon}</span>
                                <span className="font-bold text-sm">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-3 border-t-2 border-gray-100">
                <p className="text-[10px] text-center text-gray-400">&copy; 2024 نظام المختبر الطبي</p>
            </div>
        </div>
    );
};

export default Sidebar;
