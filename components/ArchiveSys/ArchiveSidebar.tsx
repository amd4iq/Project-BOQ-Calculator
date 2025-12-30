
import React, { useState } from 'react';
import { Icon } from '../Icons';

interface ArchiveSidebarProps {
    activeSection: 'structure' | 'finishes';
    onSectionChange: (section: 'structure' | 'finishes') => void;
    filters: {
        searchTerm: string;
        status: string;
        dateFrom: string;
        dateTo: string;
    };
    onFilterChange: (filters: any) => void;
    onClose: () => void;
}

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-right gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
            isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        <Icon name={icon} size={20} />
        <span>{label}</span>
    </button>
);

const FilterInput: React.FC<{
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    name: string;
    children?: React.ReactNode;
}> = ({ label, type, value, onChange, name, children }) => (
    <div>
        <label className="text-xs font-bold text-slate-500 mb-1 block">{label}</label>
        {type === 'select' ? (
             <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all"
             >
                {children}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={label}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all"
            />
        )}
    </div>
);


export const ArchiveSidebar: React.FC<ArchiveSidebarProps> = ({
    activeSection,
    onSectionChange,
    filters,
    onFilterChange,
    onClose,
}) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        onFilterChange({ searchTerm: '', status: '', dateFrom: '', dateTo: '' });
    };

    return (
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                 <Icon name="archive" size={24} className="text-primary-600" />
                 <div>
                    <h2 className="font-black text-xl text-slate-800">الأرشيف</h2>
                    <p className="text-xs text-slate-400">العروض المكتملة</p>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Navigation */}
                <nav className="space-y-2">
                    <NavButton 
                        icon="layers"
                        label="ارشيف عروض بناء الهيكل"
                        isActive={activeSection === 'structure'}
                        onClick={() => onSectionChange('structure')}
                    />
                    <NavButton 
                        icon="paint"
                        label="ارشيف عروض الانهاءات"
                        isActive={activeSection === 'finishes'}
                        onClick={() => onSectionChange('finishes')}
                    />
                </nav>

                {/* Advanced Search */}
                <div>
                    <button 
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className="w-full flex justify-between items-center p-2 text-slate-500 hover:text-slate-800"
                    >
                        <h3 className="font-bold text-sm">بحث متقدم</h3>
                        <Icon name="chevron" size={18} className={`transition-transform ${isSearchExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isSearchExpanded && (
                        <div className="p-4 bg-slate-50 rounded-xl mt-2 border border-slate-200 space-y-4 animate-in fade-in duration-300">
                             <FilterInput
                                label="بحث عام"
                                type="text"
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleInputChange}
                            />
                            <FilterInput
                                label="الحالة"
                                type="select"
                                name="status"
                                value={filters.status}
                                onChange={handleInputChange}
                            >
                                <option value="">كل الحالات</option>
                                <option value="Printed - Pending Client Approval">بانتظار قرار العميل</option>
                                <option value="Approved by Client">موافق عليه</option>
                                <option value="Rejected by Client">مرفوض</option>
                                <option value="Expired">منتهي الصلاحية</option>
                                <option value="Contract Archived">عقد مؤرشف</option>
                                <option value="Under Revision">قيد المراجعة</option>
                            </FilterInput>
                             <div className="grid grid-cols-2 gap-2">
                                 <FilterInput
                                    label="من تاريخ"
                                    type="date"
                                    name="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={handleInputChange}
                                />
                                 <FilterInput
                                    label="إلى تاريخ"
                                    type="date"
                                    name="dateTo"
                                    value={filters.dateTo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button 
                                onClick={resetFilters}
                                className="w-full text-center text-xs font-bold text-slate-500 hover:text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                إعادة تعيين
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                    عودة
                </button>
            </div>
        </aside>
    );
};
