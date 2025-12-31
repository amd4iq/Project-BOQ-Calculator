
import React, { useState } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { OverviewTab } from './OverviewTab';
import { IncomeTab } from './IncomeTab';
import { ExpensesTab } from './ExpensesTab';
import { SuppliersTab } from './SuppliersTab'; 
import { LaborTab } from './LaborTab'; 
import { SubcontractorsTab } from './SubcontractorsTab'; 
import { Contract } from '../../types';

interface ContractDashboardProps {
    contractId: string;
    onBack: () => void;
}

type Tab = 'overview' | 'income' | 'expenses' | 'project_suppliers' | 'project_labor' | 'project_subs';

// Reusable NavButton (Same as ContractsList)
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

export const ContractDashboard: React.FC<ContractDashboardProps> = ({ contractId, onBack }) => {
    const { contracts, updateContractStatus } = useContract();
    const contract = contracts.find(c => c.id === contractId);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!contract) return <div>العقد غير موجود</div>;

    const handleStatusChange = (newStatus: Contract['status']) => {
        const confirmMsg = 
            newStatus === 'Cancelled' ? 'هل أنت متأكد من إلغاء هذا العقد؟' :
            newStatus === 'Completed' ? 'هل أنت متأكد من إكمال هذا المشروع؟' :
            newStatus === 'OnHold' ? 'هل تريد إيقاف التنفيذ مؤقتاً؟' :
            'هل تريد إعادة تفعيل العقد؟';
            
        if(window.confirm(confirmMsg)) {
            updateContractStatus(contract.id, newStatus);
        }
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
            case 'Active': return 'جاري العمل';
            case 'Completed': return 'مكتمل';
            case 'OnHold': return 'متوقف مؤقتاً';
            case 'Cancelled': return 'ملغى';
            default: return status;
        }
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden" dir="rtl">
            <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(contract.status)}`}>
                            {getStatusLabel(contract.status)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{contract.offerNumber}</span>
                    </div>
                    <h2 className="font-black text-lg text-slate-800 leading-tight break-words">
                        {contract.projectDetails.projectName}
                    </h2>
                </div>
                
                <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">لوحة المعلومات</div>
                    <NavButton icon="bar-chart" label="نظرة عامة" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavButton icon="wallet" label="المقبوضات" isActive={activeTab === 'income'} onClick={() => setActiveTab('income')} />
                    <NavButton icon="trending-down" label="المصاريف" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                    
                    <div className="my-4 border-t border-slate-100"></div>
                    <div className="text-xs font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">فرق العمل والموارد</div>
                    
                    <NavButton icon="truck" label="الموردين المرتبطين" isActive={activeTab === 'project_suppliers'} onClick={() => setActiveTab('project_suppliers')} />
                    <NavButton icon="user" label="العمال والحرفيين" isActive={activeTab === 'project_labor'} onClick={() => setActiveTab('project_labor')} />
                    <NavButton icon="building" label="المقاولين الثانويين" isActive={activeTab === 'project_subs'} onClick={() => setActiveTab('project_subs')} />
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                    <div className="space-y-1">
                        {contract.status === 'Active' && (
                            <button onClick={() => handleStatusChange('OnHold')} className="w-full flex items-center justify-center gap-2 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-amber-200">
                                <Icon name="pause" size={14} /> إيقاف مؤقت
                            </button>
                        )}
                        {(contract.status === 'OnHold' || contract.status === 'Cancelled' || contract.status === 'Completed') && (
                             <button onClick={() => handleStatusChange('Active')} className="w-full flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-emerald-200">
                                <Icon name="play" size={14} /> إعادة تفعيل / استئناف
                            </button>
                        )}
                        {contract.status === 'Active' && (
                             <button onClick={() => handleStatusChange('Completed')} className="w-full flex items-center justify-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-blue-200">
                                <Icon name="check-circle" size={14} /> إكمال المشروع
                            </button>
                        )}
                    </div>
                    
                    <button onClick={onBack} className="w-full flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold transition-all active:scale-95 gap-2">
                        <Icon name="chevron" size={16} className="rotate-90" />
                        العودة للقائمة
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto scrollbar-gutter-stable">
                {activeTab === 'overview' && <OverviewTab contract={contract} />}
                {activeTab === 'income' && <IncomeTab contract={contract} />}
                {activeTab === 'expenses' && <ExpensesTab contract={contract} />}
                
                {activeTab === 'project_suppliers' && <SuppliersTab contractId={contract.id} />}
                {activeTab === 'project_labor' && <LaborTab contractId={contract.id} />}
                {activeTab === 'project_subs' && <SubcontractorsTab contractId={contract.id} />}
            </main>
        </div>
    );
};
