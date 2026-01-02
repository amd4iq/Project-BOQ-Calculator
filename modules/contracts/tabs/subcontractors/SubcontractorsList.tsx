
import React, { useState, useMemo } from 'react';
import { useContract } from '../../../../contexts/ContractContext.tsx';
import { Icon } from '../../../../components/Icons.tsx';
import { formatCurrency } from '../../../../core/utils/format.ts';
import { Subcontractor } from '../../../../core/types.ts';
import { SubcontractorModal } from './SubcontractorModal.tsx';

interface SubcontractorsListProps {
    onSelectSubcontractor: (subcontractorId: string) => void;
}

export const SubcontractorsList: React.FC<SubcontractorsListProps> = ({ onSelectSubcontractor }) => {
    const { subcontractors, getSubcontractorBalance, addSubcontractor, updateSubcontractor } = useContract();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);

    const specialties = useMemo(() => [...new Set(subcontractors.map(s => s.specialty))], [subcontractors]);

    const filteredSubcontractors = useMemo(() => {
        return subcontractors
            .filter(s => {
                const term = searchTerm.toLowerCase();
                const nameMatch = s.name.toLowerCase().includes(term);
                const phoneMatch = s.phone.includes(term);
                const specialtyMatch = s.specialty.toLowerCase().includes(term);
                return nameMatch || phoneMatch || specialtyMatch;
            })
            .filter(s => filterSpecialty === '' || s.specialty === filterSpecialty);
    }, [subcontractors, searchTerm, filterSpecialty]);

    const handleSave = (subcontractor: Subcontractor) => {
        if (editingSubcontractor) {
            updateSubcontractor(subcontractor.id, subcontractor);
        } else {
            addSubcontractor(subcontractor);
        }
        setIsModalOpen(false);
        setEditingSubcontractor(null);
    };
    
    return (
        <div className="p-8 animate-in fade-in duration-300">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">قائمة المقاولين الثانويين</h1>
                    <p className="text-slate-500 mt-1">إدارة بيانات المقاولين وحساباتهم المالية.</p>
                </div>
                <button
                    onClick={() => { setEditingSubcontractor(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                    <Icon name="plus" size={18} />
                    إضافة مقاول جديد
                </button>
            </header>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الرقم، أو الاختصاص..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <Icon name="filter" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterSpecialty}
                        onChange={e => setFilterSpecialty(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 appearance-none focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    >
                        <option value="">كل الاختصاصات</option>
                        {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 border-b-2 border-slate-100">
                        <tr>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-2/5">اسم المقاول</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">الاختصاص</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">الرصيد المالي (دين)</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">رقم الهاتف</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSubcontractors.length > 0 ? filteredSubcontractors.map(sub => {
                            const balance = getSubcontractorBalance(sub.id);
                            return (
                                <tr key={sub.id} onClick={() => onSelectSubcontractor(sub.id)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                    <td className="p-4 font-bold text-slate-800 group-hover:text-indigo-700">{sub.name}</td>
                                    <td className="p-4 text-slate-500">{sub.specialty}</td>
                                    <td className={`p-4 font-mono font-bold ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatCurrency(balance)}</td>
                                    <td className="p-4 text-slate-500 font-mono">{sub.phone}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={4} className="text-center p-10 text-slate-400">لا توجد نتائج مطابقة للبحث.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SubcontractorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                subcontractor={editingSubcontractor}
            />
        </div>
    );
};
