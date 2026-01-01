
import React, { useState } from 'react';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';
import { Contract } from '../../../core/types.ts';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';
import { SuppliersTab } from '../tabs/SuppliersTab.tsx';
import { LaborTab } from '../tabs/LaborTab.tsx';
import { SubcontractorsTab } from '../tabs/SubcontractorsTab.tsx';

interface ContractsListProps {
    onSelectContract: (contractId: string) => void;
    onClose: () => void;
    onGoToArchive: () => void;
    onGoToSettings: () => void;
    onViewQuote: (quoteId: string) => void;
}

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-right px-3 py-2.5 rounded-lg transition-colors group text-sm ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-semibold'
        }`}
    >
        <Icon name={icon} size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500 transition-colors'} />
        <span>{label}</span>
    </button>
);


const IconButton: React.FC<{ icon: string; onClick: () => void; title: string; isDestructive?: boolean; }> = ({ icon, onClick, title, isDestructive = false }) => (
    <button
        onClick={onClick}
        title={title}
        className={`flex-1 flex items-center justify-center py-2 rounded-lg font-bold transition-all active:scale-95 border shadow-sm ${
            isDestructive 
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100'
            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
        }`}
    >
        <Icon name={icon} size={18} />
    </button>
);


const StatCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: string; 
    colorClass: string; 
    bgClass: string; 
    desc: string;
    isCurrency?: boolean;
}> = ({ title, value, icon, colorClass, bgClass, desc, isCurrency = true }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-slate-500 font-bold text-xs mb-1">{title}</p>
            <h3 className={`text-2xl font-black ${colorClass}`}>
                {isCurrency && typeof value === 'number' ? formatCurrency(value) : value} 
                {isCurrency && <span className="text-sm text-slate-400"> IQD</span>}
            </h3>
            <p className="text-[10px] text-slate-400 mt-2">{desc}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
            <Icon name={icon} size={24} />
        </div>
    </div>
);

const FinancialsRow: React.FC<{label: string, value: number, icon: string, colorClass: string}> = ({label, value, icon, colorClass}) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 flex items-center gap-1.5">
            <Icon name={icon} size={14} /> {label}
        </span>
        <span className={`font-mono font-bold ${colorClass}`}>{formatCurrency(value)}</span>
    </div>
);

export const ContractsList: React.FC<ContractsListProps> = ({ onSelectContract, onClose, onGoToArchive, onGoToSettings, onViewQuote }) => {
    const { contracts, getContractFinancials, getGlobalFinancials } = useContract();
    const { currentUser, logout } = useAuth();
    const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'suppliers' | 'labor' | 'subcontractors'>('list');

    const globalStats = getGlobalFinancials();
    
    const getStatusColor = (status: Contract['status']) => {
        switch(status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'OnHold': return 'bg-amber-100 text-amber-700';
            case 'Cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    const getStatusLabel = (status: Contract['status']) => {
        switch(status) {
            case 'Active': return 'جاري العمل';
            case 'Completed': return 'مكتمل';
            case 'OnHold': return 'متوقف';
            case 'Cancelled': return 'ملغى';
            default: return status;
        }
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden" dir="rtl">
            <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20 relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
                        <Icon name="briefcase" size={20} />
                    </div>
                    <h2 className="font-black text-lg text-slate-800">إدارة العقود</h2>
                </div>
                
                {/* Navigation */}
                <div className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                     <nav className="space-y-1">
                        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">المشاريع</div>
                        <NavButton 
                            icon="layers"
                            label="قائمة المشاريع"
                            isActive={viewMode === 'list'}
                            onClick={() => setViewMode('list')}
                        />
                        <NavButton 
                            icon="pie-chart"
                            label="المالية العامة"
                            isActive={viewMode === 'dashboard'}
                            onClick={() => setViewMode('dashboard')}
                        />
                    </nav>
                     <nav className="space-y-1">
                        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الموارد</div>
                        <NavButton 
                            icon="truck"
                            label="الموردين"
                            isActive={viewMode === 'suppliers'}
                            onClick={() => setViewMode('suppliers')}
                        />
                        <NavButton 
                            icon="building"
                            label="المقاولين"
                            isActive={viewMode === 'subcontractors'}
                            onClick={() => setViewMode('subcontractors')}
                        />
                        <NavButton 
                            icon="users"
                            label="العمالة"
                            isActive={viewMode === 'labor'}
                            onClick={() => setViewMode('labor')}
                        />
                    </nav>
                </div>

                {/* Footer Buttons Group */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-3">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg font-bold transition-all active:scale-95 text-sm"
                    >
                        <Icon name="home" size={18} />
                        العودة للرئيسية
                    </button>
                    <div className="flex items-center gap-2">
                        {currentUser?.role === 'admin' && (
                            <IconButton icon="archive" onClick={onGoToArchive} title="الأرشيف" />
                        )}
                        <IconButton icon="settings" onClick={onGoToSettings} title="الإعدادات" />
                        <IconButton icon="printer" onClick={() => window.print()} title="طباعة" />
                        <IconButton icon="log-out" onClick={logout} title="خروج" isDestructive={true} />
                    </div>
                    <div className="pt-3 border-t border-slate-200 text-center">
                        <p className="text-sm font-bold text-slate-700">{currentUser?.displayName}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {viewMode === 'list' && (
                    <>
                        <header className="mb-8">
                            <h1 className="text-3xl font-black text-slate-800 leading-tight">المشاريع القائمة</h1>
                            <p className="text-slate-500 mt-1">متابعة كافة العقود النشطة والمنتهية.</p>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {contracts.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <Icon name="contract" size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">لا توجد عقود مضافة حالياً</p>
                                </div>
                            ) : (
                                contracts.map(contract => {
                                    const financials = getContractFinancials(contract.id);
                                    const debt = contract.totalContractValue - financials.totalReceived;
                                    return (
                                        <div
                                            key={contract.id}
                                            onClick={() => onSelectContract(contract.id)}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all cursor-pointer group p-4 flex flex-col"
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{contract.projectDetails.projectName}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{contract.projectDetails.customerName}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${getStatusColor(contract.status)} flex-shrink-0`}>
                                                    {getStatusLabel(contract.status)}
                                                </span>
                                            </div>
                                            <p className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-100 self-start mb-4">{contract.contractNumber}</p>
                                    
                                            {/* Financials Table */}
                                            <div className="space-y-2.5 mt-auto pt-3 border-t border-slate-100">
                                                <FinancialsRow label="قيمة العقد" value={contract.totalContractValue} icon="contract" colorClass="text-indigo-700" />
                                                <FinancialsRow label="المقبوضات" value={financials.totalReceived} icon="wallet" colorClass="text-emerald-700" />
                                                <FinancialsRow label="الديون (المتبقي)" value={debt} icon="alert" colorClass="text-amber-700" />
                                                <FinancialsRow label="الأرباح" value={financials.profit} icon="trending-up" colorClass={financials.profit >= 0 ? 'text-green-700' : 'text-rose-700'} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
                
                {viewMode === 'dashboard' && (
                    <>
                        <header className="mb-8">
                            <h1 className="text-3xl font-black text-slate-800 leading-tight">الخلاصة المالية العامة</h1>
                            <p className="text-slate-500 mt-1">كشف مالي إجمالي لجميع الالتزامات والمقبوضات.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard title="إجمالي المقبوضات" value={globalStats.totalReceived} icon="wallet" colorClass="text-emerald-600" bgClass="bg-emerald-50" desc="الدفعات المستلمة نقداً" />
                            <StatCard title="إجمالي المصاريف" value={globalStats.totalCashSpent} icon="trending-down" colorClass="text-rose-600" bgClass="bg-rose-50" desc="المصاريف النقدية المسددة" />
                            <StatCard title="إجمالي الديون" value={globalStats.totalDebt} icon="alert" colorClass="text-amber-600" bgClass="bg-amber-50" desc="المبالغ المتبقية بذمتنا" />
                        </div>
                    </>
                )}

                {viewMode === 'suppliers' && <SuppliersTab />}
                {viewMode === 'labor' && <LaborTab />}
                {viewMode === 'subcontractors' && <SubcontractorsTab />}
            </main>
        </div>
    );
};