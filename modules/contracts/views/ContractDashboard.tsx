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
    onClose: () => void;
    onGoToArchive: () => void;
    onGoToSettings: () => void;
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


export const ContractDashboard: React.FC<ContractDashboardProps> = ({ contractId, onBack, onClose, onGoToArchive, onGoToSettings }) => {
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
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'OnHold': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
            <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20 relative">
                {/* Project Brief Header */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold border ${getStatusColor(contract.status)}`}>
                            {getStatusLabel(contract.status)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Ref: {contract.offerNumber}</span>
                    </div>
                    <h2 className="font-black text-lg text-slate-800 leading-tight mb-1 truncate" title={contract.projectDetails.projectName}>{contract.projectDetails.projectName}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Icon name="user" size={12}/> {contract.projectDetails.customerName}</p>
                </div>
                
                {/* Dashboard Nav */}
                <div className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar scrollbar-gutter-stable">
                    <nav className="space-y-1">
                        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">لوحة المعلومات</div>
                        <NavButton icon="bar-chart" label="نظرة عامة" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <NavButton icon="wallet" label="المقبوضات" isActive={activeTab === 'income'} onClick={() => setActiveTab('income')} />
                        <NavButton icon="trending-down" label="المصاريف والديون" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                    </nav>

                    <nav className="space-y-1">
                        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الموارد</div>
                        <NavButton icon="truck" label="الموردين" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                        <NavButton icon="users" label="العمال والحرفيين" isActive={activeTab === 'labor'} onClick={() => setActiveTab('labor')} />
                        <NavButton icon="building" label="المقاولين الثانويين" isActive={activeTab === 'subs'} onClick={() => setActiveTab('subs')} />
                    </nav>

                    {/* Status Management inside Sidebar */}
                    <div className="border-t border-slate-100 pt-3">
                        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">إدارة حالة المشروع</div>
                        <div className="grid grid-cols-2 gap-2">
                            {contract.status === 'Active' ? (
                                <button onClick={() => handleStatusChange('OnHold')} className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                                    <Icon name="alert" size={12}/> إيقاف مؤقت
                                </button>
                            ) : (
                                <button onClick={() => handleStatusChange('Active')} className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    <Icon name="check" size={12}/> استئناف
                                </button>
                            )}
                            <button onClick={() => handleStatusChange('Completed')} className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                <Icon name="package" size={12}/> إنهاء المشروع
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer buttons group */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-3">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg font-bold transition-all active:scale-95 text-sm">
                        <Icon name="arrow-left" size={18} />
                        العودة لقائمة المشاريع
                    </button>
                    
                    <div className="flex items-center justify-around pt-3 border-t border-slate-200">
                        <button onClick={onClose} title="الرئيسية" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                            <Icon name="home" size={20} />
                        </button>
                        <button disabled title="إدارة العقود" className="p-3 text-indigo-600 bg-indigo-100 rounded-lg">
                            <Icon name="briefcase" size={20} />
                        </button>
                        <button onClick={onGoToArchive} title="الأرشيف" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
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
