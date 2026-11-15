import React from 'react';
import { GridViewIcon, ListViewIcon } from './icons/Icons';

type ViewMode = 'grid' | 'list';

interface ViewSwitcherProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border">
            <button
                onClick={() => setViewMode('grid')}
                title="عرض شبكي"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-200/50'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
            <button
                onClick={() => setViewMode('list')}
                title="عرض قائمة"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400/70 hover:text-gray-600 hover:bg-gray-200/50'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>
    );
};

export default ViewSwitcher;
