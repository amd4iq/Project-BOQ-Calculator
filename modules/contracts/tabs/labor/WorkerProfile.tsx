
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useContract } from '../../../../contexts/ContractContext';
import { Icon } from '../../../../components/Icons';
import { formatCurrency } from '../../../../core/utils/format';
import { WorkerModal } from './WorkerModal';
import { ExpenseModal } from '../../components/ExpenseModal';
import { Worker } from '../../../../core/types';

interface WorkerProfileProps {
    workerId: string;
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

export const WorkerProfile: React.FC<WorkerProfileProps> = ({ workerId, onBack }) => {
    const { workers, expenses, contracts, updateWorker } = useContract();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const worker = useMemo(() => workers.find(w => w.id === workerId), [workers, workerId]);
    const workerExpenses = useMemo(() => expenses.filter(e => e.workerId === workerId), [expenses, workerId]);

    const financialSummary = useMemo(() => {
        const totalAmount = workerExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPaid = workerExpenses.reduce((sum, e) => {
            if (e.paymentMethod === 'Cash') return sum + e.amount;
            return sum + (e.paidAmount || 0);
        }, 0);
        const balance = totalAmount - totalPaid;
        return { totalAmount, totalPaid, balance };
    }, [workerExpenses]);

    if (!worker) return <div className="p-8">العامل غير موجود.</div>;

    const handleSave = (updated: Worker) => {
        updateWorker(updated.id, updated);
        setIsEditModalOpen(false);
    };

    return (
        <div className="p-8 animate-in fade-in duration-300">
            <header className="flex justify-between items-start mb-8">
                <div className="flex items-start gap-4">
                    <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mt-1"><Icon name="arrow-left" /></button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">{worker.name}</h1>
                        <p className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block text-xs mt-1">{worker.role}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                            <span className="flex items-center gap-1.5"><Icon name="phone" size={14} /> {worker.phone || 'غير محدد'}</span>
                            <span className="flex items-center gap-1.5"><Icon name="pin" size={14} /> {worker.address || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl transition-all text-sm">
                        <Icon name="pencil" size={14} /> تعديل
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <Icon name="plus" size={16} /> إضافة أجور
                    </button>
                </div>
            </header>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="إجمالي الأجور" value={financialSummary.totalAmount} icon="dollar-sign" color="blue" />
                    <StatCard title="إجمالي المدفوع" value={financialSummary.totalPaid} icon="check-simple" color="emerald" />
                    <StatCard title="الرصيد المتبقي (دين)" value={financialSummary.balance} icon="alert" color="amber" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">سجل الأجور</h3>
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
                                {workerExpenses.length > 0 ? workerExpenses.map(exp => {
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
                                    <tr><td colSpan={5} className="text-center p-10 text-slate-400">لا توجد أجور مسجلة.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <WorkerModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                worker={worker}
            />
            <ExpenseModal 
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                beneficiary={{ type: 'Worker', id: worker.id, name: worker.name }}
            />
        </div>
    );
};
