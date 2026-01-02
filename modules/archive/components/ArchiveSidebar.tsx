
import React, { useState } from 'react';
import { Icon } from '../../../components/Icons.tsx';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';

interface ArchiveSidebarProps {
    activeSection: 'structure' | 'finishes' | 'final';
    onSectionChange: (section: 'structure' | 'finishes' | 'final') => void;
    filters: {
        searchTerm: string;
        status: string;
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
    indicatorCount?: number;
}> = ({ icon, label, isActive, onClick, indicatorCount }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between w-full text-right px-3 py-2.5 rounded-lg transition-colors group text-sm ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-semibold'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon name={icon} size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500 transition-colors'} />
            <span>{label}</span>
        </div>
        {indicatorCount && indicatorCount > 0 && (
             <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-in zoom-in ${
                 isActive 
                 ? 'bg-white text-indigo-600 shadow-sm' 
                 : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
             }`}>
                 {indicatorCount}
             </span>
        )}
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
        onFilterChange({ searchTerm: '', status: '', quoteType: '' });
    };

    return (
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg print:hidden z-50 relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                 <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
                    <Icon name="archive" size={20} />
                 </div>
                 <h2 className="font-black text-lg text-slate-800">الأرشيف</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar scrollbar-gutter-stable">
                {/* Navigation Section */}
                <nav className="space-y-1">
                    <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">العروض الجارية</div>
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
                </nav>
                <nav className="space-y-1">
                    <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">السجلات</div>
                    <NavButton 
                        icon="file-text"
                        label="الأرشيف النهائي"
                        isActive={activeSection === 'final'}
                        onClick={() => onSectionChange('final')}
                    />
                </nav>

                {/* Search & Filters Section */}
                <div className="border-t border-slate-100 pt-3">
                    <button 
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${isSearchExpanded ? 'bg-slate-50' : ''}`}
                    >
                        <h3 className="font-bold text-sm text-slate-700">البحث والفلترة</h3>
                        <Icon name="chevron" size={16} className={`transition-transform duration-200 ${isSearchExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isSearchExpanded && (
                        <div className="p-3 bg-slate-50 rounded-lg mt-2 border border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
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

            <div className="p-3 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-around">
                    <button onClick={onClose} title="الرئيسية" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                        <Icon name="home" size={20} />
                    </button>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'accountant') && (
                        <button onClick={onGoToContracts} title="إدارة العقود" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                            <Icon name="briefcase" size={20} />
                        </button>
                    )}
                    <button disabled title="الأرشيف" className="p-3 text-indigo-600 bg-indigo-100 rounded-lg">
                        <Icon name="archive" size={20} />
                    </button>
                    <button onClick={onGoToSettings} title="الإعدادات" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                        <Icon name="settings" size={20} />
                    </button>
                    <button onClick={logout} title="خروج" className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Icon name="log-out" size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
