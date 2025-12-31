
import React, { useState } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';
import { Contract } from '../../types';
import { SuppliersTab } from './SuppliersTab';
import { LaborTab } from './LaborTab';
import { SubcontractorsTab } from './SubcontractorsTab';
import { useAuth } from '../Auth/AuthContext';

interface ContractsListProps {
    onSelectContract: (contractId: string) => void;
    onClose: () => void;
    onGoToArchive: () => void;
    onGoToSettings: () => void;
}

// Reusable NavButton to match ArchiveSidebar style exactly
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

export const ContractsList: React.FC<ContractsListProps> = ({ onSelectContract, onClose, onGoToArchive, onGoToSettings }) => {
    const { contracts, getContractFinancials, getGlobalFinancials } = useContract();
    const { currentUser, logout } = useAuth();
    const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'suppliers' | 'labor' | 'subcontractors'>('list');

    const globalStats = getGlobalFinancials();
    
    // Additional Stats
    const activeContractsCount = contracts.filter(c => c.status === 'Active').length;
    const completedContractsCount = contracts.filter(c => c.status === 'Completed').length;
    const onHoldContractsCount = contracts.filter(c => c.status === 'OnHold').length;

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
            {/* Sidebar - Updated to match ArchiveSidebar width and styling */}
            <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20">
                <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl">
                        <Icon name="briefcase" size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-slate-800">إدارة العقود</h2>
                        <p className="text-xs text-slate-400">المشاريع والموردين</p>
                    </div>
                </div>
                
                <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-400 px-3 mb-2 mt-2 uppercase tracking-wider">المشاريع والمالية</div>
                    
                    <NavButton 
                        icon="layers"
                        label="قائمة المشاريع"
                        isActive={viewMode === 'list'}
                        onClick={() => setViewMode('list')}
                    />
                    <NavButton 
                        icon="pie-chart"
                        label="نظرة عامة (المالية)"
                        isActive={viewMode === 'dashboard'}
                        onClick={() => setViewMode('dashboard')}
                    />
                    
                    <div className="my-4 border-t border-slate-100"></div>
                    <div className="text-xs font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">الموارد البشرية والموردين</div>
                    
                    <NavButton 
                        icon="truck"
                        label="قاعدة الموردين"
                        isActive={viewMode === 'suppliers'}
                        onClick={() => setViewMode('suppliers')}
                    />
                    <NavButton 
                        icon="building"
                        label="المقاولين الثانويين"
                        isActive={viewMode === 'subcontractors'}
                        onClick={() => setViewMode('subcontractors')}
                    />
                    <NavButton 
                        icon="user"
                        label="العمال والأجور"
                        isActive={viewMode === 'labor'}
                        onClick={() => setViewMode('labor')}
                    />
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 z-20">
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
                                onClick={onGoToArchive}
                                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-0.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                <div className="relative bg-transparent hover:bg-white/10 transition-colors rounded-[10px] h-full flex items-center justify-center px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-white/20 rounded-lg text-white">
                                            <Icon name="archive" size={16} />
                                        </div>
                                        <span className="font-bold text-xs whitespace-nowrap">الانتقال الى الارشيف</span>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2 items-stretch">
                        <button
                            onClick={onGoToSettings}
                            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-slate-200 shadow-sm text-sm"
                            title="الملف الشخصي والإعدادات"
                        >
                            <Icon name="user" size={18} />
                            الملف الشخصي
                        </button>
                        
                        <button
                            onClick={() => window.print()}
                            className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl transition-all active:scale-95 border border-slate-200 shadow-sm"
                            title="طباعة القائمة"
                        >
                            <Icon name="printer" size={20} />
                        </button>

                        <button
                            onClick={logout}
                            className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all active:scale-95 border border-rose-100 shadow-sm"
                            title="تسجيل الخروج"
                        >
                            <Icon name="log-out" size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {viewMode === 'suppliers' && <SuppliersTab />}
                {viewMode === 'labor' && <LaborTab />}
                {viewMode === 'subcontractors' && <SubcontractorsTab />}
                
                {viewMode === 'list' && (
                    <>
                        <header className="mb-8">
                            <h1 className="text-3xl font-black text-slate-800 leading-tight">المشاريع</h1>
                            <p className="text-slate-500 mt-1">
                                قائمة بجميع المشاريع والعقود ({contracts.length} مشروع).
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contracts.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <Icon name="contract" size={48} className="mx-auto text-slate-300 mb-4"/>
                                    <h3 className="text-xl font-bold text-slate-600">لا توجد عقود نشطة</h3>
                                    <p className="text-slate-400 mt-2">يمكنك تحويل العروض المقبولة إلى عقود من خلال الأرشيف.</p>
                                </div>
                            ) : (
                                contracts.map(contract => {
                                    const financials = getContractFinancials(contract.id);
                                    
                                    return (
                                        <div 
                                            key={contract.id} 
                                            onClick={() => onSelectContract(contract.id)}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group p-5 flex flex-col justify-between"
                                        >
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                                        <Icon name={contract.projectDetails.numberOfFloors > 1 ? 'building' : 'home'} size={20} />
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusColor(contract.status)}`}>
                                                        {getStatusLabel(contract.status)}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base text-slate-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1" title={contract.projectDetails.projectName}>
                                                    {contract.projectDetails.projectName}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-mono mb-1">{contract.contractNumber || '---'}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Icon name="user" size={12}/> {contract.projectDetails.customerName}
                                                </p>
                                            </div>

                                            <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">قيمة العقد</span>
                                                    <span className="font-bold font-mono text-slate-800">{formatCurrency(contract.totalContractValue)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                     <span className="text-slate-500 font-medium">المقبوضات</span>
                                                     <span className="font-bold font-mono text-emerald-600">{formatCurrency(financials.totalReceived)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                     <span className="text-slate-500 font-medium">المصاريف</span>
                                                     <span className="font-bold font-mono text-rose-600">{formatCurrency(financials.totalSpent)}</span>
                                                </div>
                                                <div className="h-px bg-slate-200 my-1"></div>
                                                <div className="flex justify-between text-xs">
                                                     <span className="text-slate-500 font-bold">صافي الربح</span>
                                                     <span className={`font-bold font-mono ${financials.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                                         {formatCurrency(financials.profit)}
                                                     </span>
                                                </div>
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
                            <h1 className="text-3xl font-black text-slate-800 leading-tight">نظرة عامة مالية</h1>
                            <p className="text-slate-500 mt-1">
                                ملخص الأداء المالي والإداري لجميع المشاريع.
                            </p>
                        </header>

                        {/* Top: Cash Balance - Compact */}
                        <div className="bg-slate-800 p-5 rounded-2xl shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl text-slate-300">
                                    <Icon name="calculator" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">الرصيد النقدي المتوفر (نظرياً)</h3>
                                    <p className="text-slate-400 text-xs">الفرق بين إجمالي المقبوضات وإجمالي المصاريف النقدية</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className={`text-3xl font-black font-mono ${globalStats.totalReceived - globalStats.totalCashSpent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(globalStats.totalReceived - globalStats.totalCashSpent)} <span className="text-sm text-slate-500">IQD</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="مشاريع قيد التنفيذ" 
                                value={activeContractsCount} 
                                icon="layers"
                                colorClass="text-indigo-600"
                                bgClass="bg-indigo-50"
                                desc="عدد المشاريع النشطة حالياً"
                                isCurrency={false}
                            />
                            <StatCard 
                                title="مشاريع مكتملة" 
                                value={completedContractsCount} 
                                icon="check-circle"
                                colorClass="text-blue-600"
                                bgClass="bg-blue-50"
                                desc="إجمالي المشاريع المنجزة"
                                isCurrency={false}
                            />
                             <StatCard 
                                title="مشاريع متوقفة" 
                                value={onHoldContractsCount} 
                                icon="pause"
                                colorClass="text-amber-600"
                                bgClass="bg-amber-50"
                                desc="مشاريع تم إيقافها مؤقتاً"
                                isCurrency={false}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                title="إجمالي المقبوضات (الوارد)" 
                                value={globalStats.totalReceived} 
                                icon="wallet"
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-50"
                                desc="مجموع الدفعات المستلمة من العملاء نقداً"
                            />
                            <StatCard 
                                title="إجمالي المصاريف (الصادر)" 
                                value={globalStats.totalCashSpent} 
                                icon="trending-down"
                                colorClass="text-rose-600"
                                bgClass="bg-rose-50"
                                desc="مجموع ما تم صرفه نقداً على المشاريع وتسديد الديون"
                            />
                            <StatCard 
                                title="إجمالي الديون المستحقة" 
                                value={globalStats.totalDebt} 
                                icon="alert"
                                colorClass="text-amber-600"
                                bgClass="bg-amber-50"
                                desc="المبالغ المتبقية بذمتنا للموردين (لم تسدد بعد)"
                            />
                        </div>

                        {/* Project Performance Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Icon name="bar-chart" size={20} className="text-indigo-600" />
                                    الأداء المالي للمشاريع
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-4 text-right">المشروع</th>
                                            <th className="p-4 text-center">الحالة</th>
                                            <th className="p-4 text-right">قيمة العقد</th>
                                            <th className="p-4 text-right text-emerald-700">المقبوضات</th>
                                            <th className="p-4 text-right text-rose-700">المصاريف الكلية</th>
                                            <th className="p-4 text-right text-indigo-700">صافي الربح</th>
                                            <th className="p-4 text-center">نسبة الربح</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {contracts.map(contract => {
                                            const financials = getContractFinancials(contract.id);
                                            const profitMargin = contract.totalContractValue > 0 
                                                ? (financials.profit / contract.totalContractValue) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={contract.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectContract(contract.id)}>
                                                    <td className="p-4 font-bold text-slate-800">{contract.projectDetails.projectName}</td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(contract.status)}`}>
                                                            {getStatusLabel(contract.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-slate-700">{formatCurrency(contract.totalContractValue)}</td>
                                                    <td className="p-4 font-mono font-bold text-emerald-600">{formatCurrency(financials.totalReceived)}</td>
                                                    <td className="p-4 font-mono font-bold text-rose-600">{formatCurrency(financials.totalSpent)}</td>
                                                    <td className={`p-4 font-mono font-black ${financials.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                                        {formatCurrency(financials.profit)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${profitMargin >= 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'}`}>
                                                            {profitMargin.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {contracts.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد مشاريع لعرضها</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};
