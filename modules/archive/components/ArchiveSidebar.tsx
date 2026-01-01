
import React, { useState } from 'react';
import { Icon } from '../../../components/Icons.tsx';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';

interface ArchiveSidebarProps {
    activeSection: 'structure' | 'finishes' | 'final';
    onSectionChange: (section: 'structure' | 'finishes' | 'final') => void;
    filters: {
        searchTerm: string;
        status: string;
        dateFrom: string;
        dateTo: string;
        quoteType: string;
    };
    onFilterChange: (filters: any) => void;
    onClose: () => void;
    revisionCounts?: {
        structure: number;
        finishes: number;
    };
    onGoToContracts: () => void;
    onGoToSettings: () => void;
}

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    colorClass?: string;
    indicatorCount?: number;
}> = ({ icon, label, isActive, onClick, colorClass = "text-slate-600", indicatorCount }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between w-full text-right px-4 py-3 rounded-xl transition-all font-bold group ${
            isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : `${colorClass} hover:bg-slate-100`
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon name={icon} size={20} />
            <span>{label}</span>
        </div>
        {indicatorCount && indicatorCount > 0 ? (
             <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-in zoom-in ${
                 isActive 
                 ? 'bg-white text-primary-600' 
                 : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
             }`}>
                 {indicatorCount}
             </span>
        ) : null}
    </button>
);

const CompactFilterInput: React.FC<{
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    name: string;
    children?: React.ReactNode;
    placeholder?: string;
}> = ({ label, type, value, onChange, name, children, placeholder }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1 block">{label}</label>
        {type === 'select' ? (
             <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all h-8 cursor-pointer"
             >
                {children}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder || label}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all h-8"
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
    revisionCounts,
    onGoToContracts,
    onGoToSettings
}) => {
    const { currentUser, logout } = useAuth();
    const [isSearchExpanded, setIsSearchExpanded] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        onFilterChange({ searchTerm: '', status: '', dateFrom: '', dateTo: '', quoteType: '' });
    };

    return (
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg print:hidden z-50 relative">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                 <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
                    <Icon name="archive" size={24} />
                 </div>
                 <div>
                    <h2 className="font-black text-xl text-slate-800">الأرشيف</h2>
                    <p className="text-xs text-slate-400">سجل العروض والمشاريع</p>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scrollbar-gutter-stable">
                {/* Navigation Section */}
                <nav className="space-y-1.5">
                    <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">العروض الجارية</div>
                    <NavButton 
                        icon="layers"
                        label="عروض الهيكل"
                        isActive={activeSection === 'structure'}
                        onClick={() => onSectionChange('structure')}
                        indicatorCount={revisionCounts?.structure}
                    />
                    <NavButton 
                        icon="paint"
                        label="عروض الإنهاءات"
                        isActive={activeSection === 'finishes'}
                        onClick={() => onSectionChange('finishes')}
                        indicatorCount={revisionCounts?.finishes}
                    />
                    
                    <div className="my-3 border-t border-slate-50"></div>
                    
                    <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">السجلات التاريخية</div>
                    <NavButton 
                        icon="file-text"
                        label="الأرشيف النهائي"
                        isActive={activeSection === 'final'}
                        onClick={() => onSectionChange('final')}
                        colorClass="text-slate-800"
                    />
                </nav>

                {/* Search & Filters Section */}
                <div className="border-t border-slate-100 pt-4">
                    <button 
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isSearchExpanded ? 'bg-slate-50 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon name="search" size={18} />
                            <h3 className="font-bold text-sm">البحث والفلترة</h3>
                        </div>
                        <Icon name="chevron" size={16} className={`transition-transform duration-200 ${isSearchExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isSearchExpanded && (
                        <div className="p-3 bg-slate-50 rounded-xl mt-2 border border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
                             <CompactFilterInput
                                label="كلمات البحث"
                                type="text"
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleInputChange}
                                placeholder="اسم العميل، المشروع..."
                            />
                             <CompactFilterInput
                                label="نوع العرض"
                                type="select"
                                name="quoteType"
                                value={filters.quoteType}
                                onChange={handleInputChange}
                            >
                                <option value="">الكل</option>
                                <option value="structure">بناء هيكل</option>
                                <option value="finishes">إنهاءات</option>
                            </CompactFilterInput>
                            <CompactFilterInput
                                label="حالة العرض"
                                type="select"
                                name="status"
                                value={filters.status}
                                onChange={handleInputChange}
                            >
                                <option value="">الكل</option>
                                <option value="Printed - Pending Client Approval">بانتظار القرار</option>
                                <option value="Approved by Client">موافق عليه</option>
                                <option value="Rejected by Client">مرفوض</option>
                                <option value="Expired">منتهي الصلاحية</option>
                                <option value="Contract Signed">تم التعاقد</option>
                                <option value="Under Revision">قيد المراجعة</option>
                            </CompactFilterInput>
                             <div className="grid grid-cols-2 gap-2">
                                 <CompactFilterInput
                                    label="من تاريخ"
                                    type="date"
                                    name="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={handleInputChange}
                                />
                                 <CompactFilterInput
                                    label="إلى تاريخ"
                                    type="date"
                                    name="dateTo"
                                    value={filters.dateTo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button 
                                onClick={resetFilters}
                                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-red-500 py-1 transition-colors"
                            >
                                إعادة تعيين الفلاتر
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Redesigned Footer Section with all removed buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                
                <div className="flex gap-2 items-stretch">
                    <button
                        onClick={onClose}
                        className={`flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-slate-300 ${currentUser?.role === 'admin' ? 'p-3.5' : 'flex-1 py-3.5 gap-2'}`}
                        title="الرئيسية"
                    >
                        <Icon name="home" size={20} />
                        {currentUser?.role !== 'admin' && (
                            <span>الرئيسية</span>
                        )}
                    </button>

                    {currentUser?.role === 'admin' && (
                        <button
                            onClick={onGoToContracts}
                            className="flex-1 group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-0.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            <div className="relative bg-transparent hover:bg-white/10 transition-colors rounded-[10px] h-full flex items-center justify-center px-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-white/20 rounded-lg text-white">
                                        <Icon name="briefcase" size={16} />
                                    </div>
                                    <span className="font-bold text-xs whitespace-nowrap">إدارة المشاريع</span>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={onGoToSettings}
                        className="flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-slate-200 shadow-sm"
                        title="الملف الشخصي والإعدادات"
                    >
                        <Icon name="user" size={18} />
                    </button>
                    
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-slate-200 shadow-sm"
                        title="طباعة سجل الأرشيف"
                    >
                        <Icon name="printer" size={20} />
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-rose-100 shadow-sm"
                        title="تسجيل الخروج"
                    >
                        <Icon name="log-out" size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );
};