
import React, { useState } from 'react';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { OverviewTab } from '../tabs/OverviewTab.tsx';
import { IncomeTab } from '../tabs/IncomeTab.tsx';
import { ExpensesTab } from '../tabs/ExpensesTab.tsx';
import { SuppliersTab } from '../tabs/SuppliersTab.tsx'; 
import { LaborTab } from '../tabs/LaborTab.tsx'; 
import { SubcontractorsTab } from '../tabs/SubcontractorsTab.tsx'; 
import { Contract } from '../../../core/types.ts';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';

interface ContractDashboardProps {
    contractId: string;
    onBack: () => void;
}

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl transition-all font-bold ${
            isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        <Icon name={icon} size={20} />
        <span>{label}</span>
    </button>
);

export const ContractDashboard: React.FC<ContractDashboardProps> = ({ contractId, onBack }) => {
    const { contracts, updateContractStatus } = useContract();
    const { logout, currentUser } = useAuth();
    const contract = contracts.find(c => c.id === contractId);
    const [activeTab, setActiveTab] = useState<string>('overview');

    if (!contract) return <div className="p-8 text-center text-slate-500">العقد غير موجود</div>;

    const handleStatusChange = (newStatus: Contract['status']) => {
        const confirmMsg = 
            newStatus === 'Cancelled' ? 'إلغاء هذا العقد نهائياً؟' :
            newStatus === 'Completed' ? 'تغيير حالة المشروع إلى مكتمل؟' :
            'تغيير حالة تنفيذ العقد؟';
        if(window.confirm(confirmMsg)) updateContractStatus(contract.id, newStatus);
    };

    const getStatusColor = (status: Contract['status']) => {
        switch(status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'OnHold': return 'bg-amber-100 text-amber-700';
            case 'Cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    }

    const getStatusLabel = (status: Contract['status']) => {
        switch(status) {
            case 'Active': return 'جاري التنفيذ';
            case 'Completed': return 'مكتمل';
            case 'OnHold': return 'متوقف مؤقتاً';
            case 'Cancelled': return 'ملغى';
            default: return status;
        }
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden" dir="rtl">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20 relative">
                {/* Project Brief Header */}
                <div className="p-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold border ${getStatusColor(contract.status)}`}>
                            {getStatusLabel(contract.status)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Ref: {contract.offerNumber}</span>
                    </div>
                    <h2 className="font-black text-lg text-slate-800 leading-tight mb-1">{contract.projectDetails.projectName}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Icon name="user" size={12}/> {contract.projectDetails.customerName}</p>
                </div>
                
                {/* Dashboard Nav */}
                <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar scrollbar-gutter-stable">
                    <nav className="space-y-1.5">
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">لوحة المعلومات</div>
                        <NavButton icon="bar-chart" label="نظرة عامة" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <NavButton icon="wallet" label="المقبوضات" isActive={activeTab === 'income'} onClick={() => setActiveTab('income')} />
                        <NavButton icon="trending-down" label="المصاريف والديون" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                    </nav>

                    <nav className="space-y-1.5">
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الموارد</div>
                        <NavButton icon="truck" label="الموردين المرتبطين" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                        <NavButton icon="user" label="العمال والحرفيين" isActive={activeTab === 'labor'} onClick={() => setActiveTab('labor')} />
                        <NavButton icon="building" label="المقاولين الثانويين" isActive={activeTab === 'subs'} onClick={() => setActiveTab('subs')} />
                    </nav>

                    {/* Status Management inside Sidebar */}
                    <div className="pt-4 border-t border-slate-50 space-y-2">
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">إدارة حالة المشروع</div>
                        <div className="grid grid-cols-2 gap-2">
                            {contract.status === 'Active' ? (
                                <button onClick={() => handleStatusChange('OnHold')} className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                                    <Icon name="pause" size={12}/> إيقاف
                                </button>
                            ) : (
                                <button onClick={() => handleStatusChange('Active')} className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    <Icon name="play" size={12}/> استئناف
                                </button>
                            )}
                            <button onClick={() => handleStatusChange('Completed')} className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                <Icon name="check-circle" size={12}/> إنهاء
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer buttons group */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm">
                        <Icon name="chevron" size={16} className="rotate-90" />
                        العودة للقائمة
                    </button>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => {}} // Could link to a main overview
                            className="flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                            title="الرئيسية"
                        >
                            <Icon name="home" size={18} />
                        </button>
                        
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-slate-200 shadow-sm"
                            title="طباعة تقرير المشروع"
                        >
                            <Icon name="printer" size={20} />
                        </button>

                        <button
                            onClick={logout}
                            className="flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-rose-100 shadow-sm"
                            title="خروج"
                        >
                            <Icon name="log-out" size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                {activeTab === 'overview' && <OverviewTab contract={contract} />}
                {activeTab === 'income' && <IncomeTab contract={contract} />}
                {activeTab === 'expenses' && <ExpensesTab contract={contract} />}
                {activeTab === 'suppliers' && <SuppliersTab contractId={contract.id} />}
                {activeTab === 'labor' && <LaborTab contractId={contract.id} />}
                {activeTab === 'subs' && <SubcontractorsTab contractId={contract.id} />}
            </main>
        </div>
    );
};
