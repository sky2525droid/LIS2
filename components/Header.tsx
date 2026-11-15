
import React from 'react';
import { Page, LabSettings } from '../types';

interface HeaderProps {
    currentPage: Page;
    labSettings: LabSettings;
    onLogout?: () => void;
}

const pageTitles: Record<Page, string> = {
    dashboard: 'الصفحة الرئيسية',
    patients: 'إدارة المرضى',
    sampleCollection: 'سحب العينات',
    results: 'إدخال النتائج المخبرية',
    qualityControl: 'ضبط الجودة ومراجعة النتائج',
    orders: 'إدارة طلبات الفحص',
    tests: 'الفحوصات المخبرية',
    settings: 'إعدادات النظام والتكامل',
    statistics: 'الإحصائيات والتقارير العامة',
    financials: 'التقرير المالي والتحصيل',
    workflow: 'دليل العمل المصور (واقعي)',
    reagents: 'مستودع الكواشف المخبرية',
};

const Header: React.FC<HeaderProps> = ({ currentPage, labSettings, onLogout }) => {
    return (
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-6 border-b-2">
            <h2 className="text-xl font-bold text-gray-700">{pageTitles[currentPage]}</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
                 <div className="relative">
                    <button className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </button>
                 </div>
                 <div className="flex items-center">
                    <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100" alt="User" referrerPolicy="no-referrer" />
                    <div className="ms-2">
                        <p className="text-xs font-semibold text-gray-800">{labSettings.labDirector}</p>
                        <p className="text-[10px] text-gray-500">مدير المختبر</p>
                    </div>
                </div>
                {onLogout && (
                    <button 
                        onClick={onLogout} 
                        className="text-sm text-red-600 hover:text-red-800 font-semibold bg-red-50 px-3 py-1 rounded-md transition-colors"
                    >
                        تسجيل الخروج
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
