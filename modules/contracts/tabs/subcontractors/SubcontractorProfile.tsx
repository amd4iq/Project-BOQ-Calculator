
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useContract } from '../../../../contexts/ContractContext';
import { Icon } from '../../../../components/Icons';
import { formatCurrency } from '../../../../core/utils/format';
import { SubcontractorModal } from './SubcontractorModal';
import { ExpenseModal } from '../../components/ExpenseModal';
import { Subcontractor } from '../../../../core/types';

interface SubcontractorProfileProps {
    subcontractorId: string;
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <div className={`p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-full ${colors[color]}`}>
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded-lg shadow-sm"><Icon name={icon} size={20} /></div>
                 <p className="text-xs font-bold opacity-80">{title}</p>
            </div>
            <p className="text-3xl font-black mt-4">{formatCurrency(value)}</p>
        </div>
    );
};

export const SubcontractorProfile: React.FC<SubcontractorProfileProps> = ({ subcontractorId, onBack }) => {
    const { subcontractors, expenses, contracts, updateSubcontractor } = useContract();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
    const projectsDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectsDropdownRef.current && !projectsDropdownRef.current.contains(event.target as Node)) {
                setIsProjectsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const subcontractor = useMemo(() => subcontractors.find(s => s.id === subcontractorId), [subcontractors, subcontractorId]);
    const subcontractorExpenses = useMemo(() => expenses.filter(e => e.subcontractorId === subcontractorId), [expenses, subcontractorId]);

    const financialSummary = useMemo(() => {
        const totalAmount = subcontractorExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPaid = subcontractorExpenses.reduce((sum, e) => {
            if (e.paymentMethod === 'Cash') return sum + e.amount;
            return sum + (e.paidAmount || 0);
        }, 0);
        const balance = totalAmount - totalPaid;
        return { totalAmount, totalPaid, balance };
    }, [subcontractorExpenses]);

    const projectsSummary = useMemo(() => {
        const projects: { [key: string]: { contractId: string, projectName: string, totalAmount: number, totalPaid: number, balance: number } } = {};

        subcontractorExpenses.forEach(exp => {
            if (!projects[exp.contractId]) {
                const contract = contracts.find(c => c.id === exp.contractId);
                projects[exp.contractId] = {
                    contractId: exp.contractId,
                    projectName: contract?.projectDetails.projectName || 'مشروع غير محدد',
                    totalAmount: 0,
                    totalPaid: 0,
                    balance: 0,
                };
            }
            const project = projects[exp.contractId];
            project.totalAmount += exp.amount;
            const paid = exp.paymentMethod === 'Cash' ? exp.amount : (exp.paidAmount || 0);
            project.totalPaid += paid;
            project.balance = project.totalAmount - project.totalPaid;
        });

        return Object.values(projects);
    }, [subcontractorExpenses, contracts]);

    if (!subcontractor) return <div className="p-8">المقاول غير موجود.</div>;

    const handleSave = (updated: Subcontractor) => {
        updateSubcontractor(updated.id, updated);
        setIsEditModalOpen(false);
    };

    return (
        <div className="p-8 animate-in fade-in duration-300">
            <header className="flex justify-between items-start mb-8">
                <div className="flex items-start gap-4">
                    <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mt-1"><Icon name="arrow-left" /></button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">{subcontractor.name}</h1>
                        <p className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block text-xs mt-1">{subcontractor.specialty}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                            <span className="flex items-center gap-1.5"><Icon name="phone" size={14} /> {subcontractor.phone || 'غير محدد'}</span>
                            <span className="flex items-center gap-1.5"><Icon name="pin" size={14} /> {subcontractor.address || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl transition-all text-sm">
                        <Icon name="pencil" size={14} /> تعديل
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <Icon name="plus" size={16} /> إضافة مصروف
                    </button>
                </div>
            </header>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="إجمالي التعاملات" value={financialSummary.totalAmount} icon="dollar-sign" color="blue" />
                    <StatCard title="إجمالي المدفوع" value={financialSummary.totalPaid} icon="check-simple" color="emerald" />
                    <StatCard title="الرصيد المتبقي (دين)" value={financialSummary.balance} icon="alert" color="amber" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">سجل المصاريف</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="text-slate-500 bg-slate-100 sticky top-0">
                                <tr>
                                    <th className="p-3 text-right">التاريخ</th>
                                    <th className="p-3 text-right">الوصف</th>
                                    <th className="p-3 text-right">المشروع</th>
                                    <th className="p-3 text-right">المبلغ</th>
                                    <th className="p-3 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subcontractorExpenses.length > 0 ? subcontractorExpenses.map(exp => {
                                    const contract = contracts.find(c => c.id === exp.contractId);
                                    const remaining = exp.amount - (exp.paymentMethod === 'Cash' ? exp.amount : (exp.paidAmount || 0));
                                    let status;
                                    if (exp.paymentMethod === 'Cash' || remaining <= 0) {
                                        status = <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded">مسدد</span>;
                                    } else {
                                        status = <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded">دين</span>;
                                    }
                                    return (
                                        <tr key={exp.id}>
                                            <td className="p-3 font-mono text-slate-500">{new Date(exp.date).toLocaleDateString('ar-IQ')}</td>
                                            <td className="p-3 font-bold text-slate-800">{exp.description}</td>
                                            <td className="p-3 text-indigo-600 font-bold text-xs">{contract?.projectDetails.projectName || 'غير محدد'}</td>
                                            <td className="p-3 font-mono font-bold text-rose-600">{formatCurrency(exp.amount)}</td>
                                            <td className="p-3 text-center">{status}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={5} className="text-center p-10 text-slate-400">لا توجد مصاريف مسجلة.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SubcontractorModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                subcontractor={subcontractor}
            />
            <ExpenseModal 
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                beneficiary={{ type: 'Subcontractor', id: subcontractor.id, name: subcontractor.name }}
            />
        </div>
    );
};
