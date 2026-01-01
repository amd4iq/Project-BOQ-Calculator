
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contract, Expense } from '../../../core/types.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';
import { ExpenseModal } from '../components/ExpenseModal.tsx';
import { PaymentModal } from '../components/PaymentModal.tsx';
import { PaymentHistoryModal } from '../components/PaymentHistoryModal.tsx';

// --- Stat Card Component ---
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colors: any = {
        rose: 'bg-rose-50 text-rose-600',
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

// --- Main ExpensesTab Component ---
export const ExpensesTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { getContractExpenses, payPartialDebt, deleteExpense, suppliers, workers, subcontractors } = useContract();
    
    const translateCategory = (category: Expense['category']) => {
        switch(category) {
            case 'Material': return 'مواد';
            case 'Labor': return 'أجور';
            case 'Transport': return 'نقل';
            case 'Other': return 'أخرى';
            case 'DebtPayment': return 'تسديد دين';
            default: return category;
        }
    };

    // State Management
    const [filters, setFilters] = useState({ term: '', category: '', beneficiary: '', status: '' });
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    const filterRef = useRef<HTMLDivElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (filterRef.current && !filterRef.current.contains(target)) {
                setIsFiltersVisible(false);
            }
            if (actionMenuRef.current && !actionMenuRef.current.contains(target)) {
                 setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const expenses = getContractExpenses(contract.id);

    // Memoized calculations for performance
    const { totalSpent, totalPaid, totalDebt } = useMemo(() => {
        let spent = 0, paid = 0;
        expenses.forEach(e => {
            spent += e.amount;
            paid += e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0);
        });
        return { totalSpent: spent, totalPaid: paid, totalDebt: spent - paid };
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const remaining = exp.amount - (exp.paidAmount || 0);
            let status = 'Unpaid';
            if(exp.paymentMethod === 'Cash' || remaining <= 0) status = 'Paid';
            else if ((exp.paidAmount || 0) > 0) status = 'Partially Paid';
            
            const beneficiaryName = 
                (exp.supplierId ? suppliers.find(s=>s.id === exp.supplierId)?.name : '') ||
                (exp.workerId ? workers.find(w=>w.id === exp.workerId)?.name : '') ||
                (exp.subcontractorId ? subcontractors.find(s=>s.id === exp.subcontractorId)?.name : '');

            return (
                (filters.term === '' || exp.description.toLowerCase().includes(filters.term.toLowerCase())) &&
                (filters.category === '' || exp.category === filters.category) &&
                (filters.status === '' || status === filters.status) &&
                (filters.beneficiary === '' || beneficiaryName?.toLowerCase().includes(filters.beneficiary.toLowerCase()))
            );
        }).sort((a, b) => {
            const dateDiff = b.date - a.date;
            if (dateDiff !== 0) return dateDiff;
            
            // Fallback for items with same date: sort by creation timestamp from ID
            const idA = parseInt(a.id.split('-')[1] || '0');
            const idB = parseInt(b.id.split('-')[1] || '0');
            return idB - idA;
        });
    }, [expenses, filters, suppliers, workers, subcontractors]);

    const selectedExpenseForMenu = useMemo(() => {
        return openMenuId ? filteredExpenses.find(e => e.id === openMenuId) : null;
    }, [openMenuId, filteredExpenses]);

    // Handlers for Modals and Actions
    const handleOpenModal = (expense: Expense | null) => { setSelectedExpense(expense); setIsModalOpen(true); setOpenMenuId(null); };
    const handleOpenPayModal = (expense: Expense) => { setSelectedExpense(expense); setIsPayModalOpen(true); setOpenMenuId(null); };
    const handleOpenHistoryModal = (expense: Expense) => { setSelectedExpense(expense); setIsHistoryModalOpen(true); setOpenMenuId(null); };

    const handleMenuToggle = (e: React.MouseEvent, expenseId: string) => {
        e.stopPropagation();
        if (openMenuId === expenseId) {
            setOpenMenuId(null);
        } else {
            const button = e.currentTarget as HTMLElement;
            const rect = button.getBoundingClientRect();
            setOpenMenuId(expenseId);
            setMenuPosition({ top: rect.bottom, left: rect.left });
        }
    };

    const handleConfirmPayment = (amount: number, date: string, attachmentUrl?: string) => {
        if (!selectedExpense) return;
        payPartialDebt(selectedExpense, amount, new Date(date).getTime(), attachmentUrl);
        setIsPayModalOpen(false);
    };

    const remainingDebt = selectedExpense ? selectedExpense.amount - (selectedExpense.paidAmount || 0) : 0;
    
    // UI Components
    const renderStatusBadge = (exp: Expense) => {
        const remaining = exp.amount - (exp.paidAmount || 0);
        const progress = exp.amount > 0 ? ((exp.paidAmount || 0) / exp.amount) * 100 : 0;

        if (exp.paymentMethod === 'Cash' || remaining <= 0) {
            return <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1.5"><Icon name="check-simple" size={12}/>مسدد</div>;
        }
        if ((exp.paidAmount || 0) > 0) {
            return (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-700">جزئي</span>
                        <span className="text-[9px] font-mono text-blue-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full" style={{width: `${progress}%`}}></div></div>
                </div>
            )
        }
        return <div className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md flex items-center gap-1.5"><Icon name="alert" size={12}/>بذمتنا</div>;
    };
    
    const renderBeneficiary = (exp: Expense) => {
        if(exp.supplierId) return <><Icon name="truck" size={12} className="text-slate-400"/><span>{suppliers.find(s=>s.id === exp.supplierId)?.name}</span></>
        if(exp.workerId) return <><Icon name="user" size={12} className="text-slate-400"/><span>{workers.find(w=>w.id === exp.workerId)?.name}</span></>
        if(exp.subcontractorId) return <><Icon name="building" size={12} className="text-slate-400"/><span>{subcontractors.find(s=>s.id === exp.subcontractorId)?.name}</span></>
        return <span className="text-slate-400">غير محدد</span>;
    }

    return (
        <div className="p-8 space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">سجل المصاريف والديون</h1>
                    <p className="text-slate-500 mt-1">متابعة المصروفات والديون الخاصة بالمشروع</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={filterRef}>
                        <button 
                            onClick={() => setIsFiltersVisible(!isFiltersVisible)} 
                            className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl transition-all text-sm flex items-center gap-2"
                        >
                            <Icon name="filter" size={16}/>
                            فلترة
                        </button>
                        {isFiltersVisible && (
                            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-20 space-y-3 animate-in fade-in zoom-in-95">
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">بحث بالوصف</label>
                                    <input type="text" placeholder="بحث..." value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">بحث بالمستفيد</label>
                                     <input type="text" placeholder="بحث..." value={filters.beneficiary} onChange={e => setFilters({...filters, beneficiary: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">نوع المصروف</label>
                                    <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                        <option value="">كل الأنواع</option>
                                        <option value="Material">مواد</option>
                                        <option value="Labor">أجور</option>
                                        <option value="Transport">نقل</option>
                                        <option value="Other">أخرى</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">حالة الدفع</label>
                                    <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="">كل الحالات</option><option>Paid</option><option>Unpaid</option><option>Partially Paid</option></select>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={() => handleOpenModal(null)} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2"><Icon name="plus" size={16}/> إضافة مصروف</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="إجمالي مصاريف المشروع" value={totalSpent} icon="trending-down" color="rose" />
                <StatCard title="إجمالي المدفوعات" value={totalPaid} icon="check-simple" color="emerald" />
                <StatCard title="الديون المتبقية" value={totalDebt} icon="alert" color="amber" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3 text-center w-12">#</th>
                                {['التاريخ', 'الوصف', 'المستفيد', 'النوع', 'المبلغ الكلي', 'المدفوع', 'المتبقي', 'الحالة', 'الإجراءات'].map(h => <th key={h} className="p-3 text-right">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.map((exp, index) => {
                                const remaining = exp.amount - (exp.paidAmount || 0);
                                return (
                                <tr key={exp.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-slate-400 text-center">{index + 1}</td>
                                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{new Date(exp.date).toLocaleDateString('ar-IQ')}</td>
                                    <td className="p-3 text-xs text-slate-700">{exp.description}</td>
                                    <td className="p-3 text-xs text-slate-600"><div className="flex items-center gap-1.5">{renderBeneficiary(exp)}</div></td>
                                    <td className="p-3 text-xs font-medium text-slate-500">{translateCategory(exp.category)}</td>
                                    <td className="p-3 font-mono text-slate-800">{formatCurrency(exp.amount)}</td>
                                    <td className="p-3 font-mono text-emerald-600">{formatCurrency(exp.paidAmount || 0)}</td>
                                    <td className="p-3 font-mono text-amber-600">{formatCurrency(remaining)}</td>
                                    <td className="p-3 w-32">{renderStatusBadge(exp)}</td>
                                    <td className="p-3">
                                        <button onClick={(e) => handleMenuToggle(e, exp.id)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-md"><Icon name="settings" size={16}/></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {openMenuId && menuPosition && selectedExpenseForMenu && (
                <div
                    ref={actionMenuRef}
                    style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                    className="fixed w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95"
                >
                    {(() => {
                        const remaining = selectedExpenseForMenu.amount - (selectedExpenseForMenu.paidAmount || 0);
                        return (
                            <>
                                <button onClick={() => handleOpenModal(selectedExpenseForMenu)} className="w-full text-right text-xs p-2 rounded hover:bg-slate-100 flex items-center gap-2"><Icon name="pencil" size={14}/>تعديل</button>
                                {remaining > 0 && <button onClick={() => handleOpenPayModal(selectedExpenseForMenu)} className="w-full text-right text-xs p-2 rounded hover:bg-slate-100 flex items-center gap-2"><Icon name="wallet" size={14}/>تسجيل دفعة</button>}
                                {(selectedExpenseForMenu.paidAmount || 0) > 0 && <button onClick={() => handleOpenHistoryModal(selectedExpenseForMenu)} className="w-full text-right text-xs p-2 rounded hover:bg-slate-100 flex items-center gap-2"><Icon name="file-text" size={14}/>عرض سجل الدفع</button>}
                                {selectedExpenseForMenu.attachmentUrl && <button onClick={() => { setPreviewImage(selectedExpenseForMenu.attachmentUrl!); setOpenMenuId(null); }} className="w-full text-right text-xs p-2 rounded hover:bg-slate-100 flex items-center gap-2"><Icon name="image-plus" size={14}/>عرض الوصل</button>}
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={() => { if(window.confirm('متأكد؟')) deleteExpense(selectedExpenseForMenu.id); setOpenMenuId(null); }} className="w-full text-right text-xs p-2 rounded hover:bg-rose-50 text-rose-600 flex items-center gap-2"><Icon name="trash" size={14}/>حذف</button>
                            </>
                        );
                    })()}
                </div>
            )}
            
            {/* Modals */}
            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contractId={contract.id} expense={selectedExpense}/>
            <PaymentModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} expense={selectedExpense} remainingAmount={remainingDebt} onConfirm={handleConfirmPayment} />
            <PaymentHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} expense={selectedExpense}/>
            {previewImage && (<div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><img src={previewImage} alt="Attachment" className="max-w-full max-h-full rounded-lg shadow-2xl" /></div>)}
        </div>
    );
};
