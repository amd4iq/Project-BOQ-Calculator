
import React, { useState, useMemo } from 'react';
import { useContract } from '../../../../contexts/ContractContext.tsx';
import { Icon } from '../../../../components/Icons.tsx';
import { formatCurrency } from '../../../../core/utils/format.ts';
import { Worker } from '../../../../core/types.ts';
import { WorkerModal } from './WorkerModal.tsx';

interface LaborListProps {
    onSelectWorker: (workerId: string) => void;
}

export const LaborList: React.FC<LaborListProps> = ({ onSelectWorker }) => {
    const { workers, getWorkerBalance, addWorker, updateWorker } = useContract();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

    const roles = useMemo(() => [...new Set(workers.map(w => w.role))], [workers]);

    const filteredWorkers = useMemo(() => {
        return workers
            .filter(w => {
                const term = searchTerm.toLowerCase();
                const nameMatch = w.name.toLowerCase().includes(term);
                const phoneMatch = w.phone.includes(term);
                const roleMatch = w.role.toLowerCase().includes(term);
                return nameMatch || phoneMatch || roleMatch;
            })
            .filter(w => filterRole === '' || w.role === filterRole);
    }, [workers, searchTerm, filterRole]);

    const handleSave = (worker: Worker) => {
        if (editingWorker) {
            updateWorker(worker.id, worker);
        } else {
            addWorker(worker);
        }
        setIsModalOpen(false);
        setEditingWorker(null);
    };
    
    return (
        <div className="p-8 animate-in fade-in duration-300">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">قائمة العمال والحرفيين</h1>
                    <p className="text-slate-500 mt-1">إدارة بيانات العمال وأجورهم وحساباتهم المالية.</p>
                </div>
                <button
                    onClick={() => { setEditingWorker(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                    <Icon name="plus" size={18} />
                    إضافة عامل جديد
                </button>
            </header>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الرقم، أو الحرفة..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <Icon name="filter" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    >
                        <option value="">كل الحرف</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 border-b-2 border-slate-100">
                        <tr>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-2/5">اسم العامل</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">الدور/الحرفة</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">الرصيد المالي (دين)</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">رقم الهاتف</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredWorkers.length > 0 ? filteredWorkers.map(worker => {
                            const balance = getWorkerBalance(worker.id);
                            return (
                                <tr key={worker.id} onClick={() => onSelectWorker(worker.id)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                    <td className="p-4 font-bold text-slate-800 group-hover:text-indigo-700">{worker.name}</td>
                                    <td className="p-4 text-slate-500">{worker.role}</td>
                                    <td className={`p-4 font-mono font-bold ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatCurrency(balance)}</td>
                                    <td className="p-4 text-slate-500 font-mono">{worker.phone}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={4} className="text-center p-10 text-slate-400">لا توجد نتائج مطابقة للبحث.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <WorkerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                worker={editingWorker}
            />
        </div>
    );
};
