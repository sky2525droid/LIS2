import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'indigo' | 'purple';
    onClick?: () => void;
}

const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
    const { bg, text } = colorClasses[color] || colorClasses.blue;
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex flex-col gap-0.5">
                <p className="text-gray-400 font-bold text-[10px] uppercase">{title}</p>
                <p className="text-xl font-black text-gray-800">{value}</p>
            </div>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg} ${text}`}>
                <div className="w-4.5 h-4.5">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;