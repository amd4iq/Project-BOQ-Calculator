
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Contract, Expense } from '../../types';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';

// --- Payment History Modal ---
const PaymentHistoryModal: React.FC<{
    expense: Expense | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ expense, isOpen, onClose }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    if (!isOpen || !expense) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-0 overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                            <Icon name="file-text" size={24} className="text-purple-600"/>
                            سجل تسديد الدفعات
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">للمصروف: <span className="font-bold">{expense.description}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><Icon name="x" size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/30">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 font-bold mb-1">المبلغ الكلي</p>
                            <p className="text-lg font-black text-slate-800 font-mono">{formatCurrency(expense.amount)}</p>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                            <p className="text-xs text-emerald-600 font-bold mb-1">تم تسديده</p>
                            <p className="text-lg font-black text-emerald-700 font-mono">{formatCurrency(expense.paidAmount || 0)}</p>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                            <p className="text-xs text-amber-600 font-bold mb-1">المتبقي</p>
                            <p className="text-lg font-black text-amber-700 font-mono">{formatCurrency(expense.amount - (expense.paidAmount || 0))}</p>
                        </div>
                    </div>

                    {!expense.paymentHistory || expense.paymentHistory.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-sm font-bold">لا يوجد سجل تفصيلي للدفعات السابقة</p>
                            {expense.paidAmount && expense.paidAmount > 0 && (
                                <p className="text-xs text-slate-400 mt-1">تم تسجيل المدفوعات كإجمالي فقط قبل تفعيل نظام السجل.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الدفعات المسجلة</h4>
                            {expense.paymentHistory.slice().reverse().map((entry, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-100 text-slate-500 font-mono text-xs font-bold px-3 py-2 rounded-lg">
                                            {new Date(entry.date).toLocaleDateString('ar-IQ')}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 font-mono text-lg">{formatCurrency(entry.amount)} <span className="text-xs font-normal text-slate-400">IQD</span></p>
                                        </div>
                                    </div>
                                    {entry.attachmentUrl && (
                                        <button onClick={() => setPreviewImage(entry.attachmentUrl!)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                                            <Icon name="image-plus" size={16} />
                                            الوصل
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview inside Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black hover:bg-slate-200 shadow-lg">
                            <Icon name="x" size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Payment Modal Component (For Debt Repayment) ---
const PaymentModal: React.FC<{
    expense: Expense | null;
    remainingAmount: number;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, date: string, attachmentUrl?: string) => void;
}> = ({ expense, remainingAmount, isOpen, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attachment, setAttachment] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isOpen && expense) {
            setAmount(remainingAmount);
            setDate(new Date().toISOString().split('T')[0]);
            setAttachment(undefined);
        }
    }, [isOpen, expense, remainingAmount]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen || !expense) return null;

    const totalAmount = expense.amount;
    const previouslyPaid = expense.paidAmount || 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full">
                        <Icon name="check-circle" size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-slate-800">تسديد دفعة (جزء من المبلغ)</h3>
                        <p className="text-xs text-slate-500 font-medium">سداد دين سابق</p>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                    <p className="text-xs text-slate-500 mb-1">المصروف:</p>
                    <p className="font-bold text-slate-900 text-sm mb-3">{expense.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-200/50 pt-2">
                        <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5">الكلي</span>
                            <span className="font-mono font-bold text-xs text-slate-700">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-emerald-600 block mb-0.5">المدفوع</span>
                            <span className="font-mono font-bold text-xs text-emerald-700">{formatCurrency(previouslyPaid)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-amber-600 block mb-0.5">المتبقي</span>
                            <span className="font-mono font-bold text-xs text-amber-700">{formatCurrency(remainingAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 text-sm font-mono bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount} 
                                max={remainingAmount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 font-bold text-lg text-slate-800 font-mono pl-16 transition-all"
                                autoFocus
                                placeholder="المبلغ المراد تسديده"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">IQD</span>
                        </div>
                        <div className="flex items-center mt-2">
                            <p className="text-[10px] text-slate-400 font-mono font-medium">
                                المتبقي بعد الدفع: {formatCurrency(remainingAmount - (amount || 0))}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-slate-500 p-3 rounded-xl transition-all border-dashed group">
                            <Icon name={attachment ? "check" : "image-plus"} size={18} className={`transition-colors ${attachment ? "text-emerald-500" : "group-hover:text-emerald-500"}`} />
                            <span className={`text-xs font-bold transition-colors ${attachment ? "text-emerald-600" : "group-hover:text-emerald-600"}`}>{attachment ? "تم ارفاق صورة" : "اضغط لرفع صورة الوصل"}</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">إلغاء</button>
                    <button 
                        onClick={() => onConfirm(amount, date, attachment)}
                        disabled={amount <= 0 || amount > remainingAmount}
                        className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                        تأكيد العملية
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ExpensesTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { addExpense, updateExpense, deleteExpense, getContractExpenses, payPartialDebt, suppliers, workers, subcontractors } = useContract();
    const expenses = getContractExpenses(contract.id);

    // --- Form State ---
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Expense['category']>('Material');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
    const [attachment, setAttachment] = useState<string | undefined>(undefined);
    
    // Beneficiary Logic
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const descriptionInputRef = useRef<HTMLInputElement>(null);
    
    // --- Inline Editing State ---
    const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<any | null>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterBeneficiaryType, setFilterBeneficiaryType] = useState<string>('All');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('All');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Payment & History Logic
    const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);
    const [historyExpense, setHistoryExpense] = useState<Expense | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getBeneficiaryName = (exp: Expense) => {
        if (exp.supplierId) return suppliers.find(s => s.id === exp.supplierId)?.name || 'مورد محذوف';
        if (exp.workerId) return workers.find(w => w.id === exp.workerId)?.name || 'عامل محذوف';
        if (exp.subcontractorId) return subcontractors.find(s => s.id === exp.subcontractorId)?.name || 'مقاول محذوف';
        return '-';
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const matchesSearch = 
                exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getBeneficiaryName(exp).toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
            const matchesBeneficiaryType = filterBeneficiaryType === 'All' || exp.beneficiaryType === filterBeneficiaryType;
            
            let matchesPayment = true;
            const remaining = exp.amount - (exp.paidAmount || 0);
            if (filterPaymentStatus === 'Cash') matchesPayment = exp.paymentMethod === 'Cash';
            if (filterPaymentStatus === 'Credit') matchesPayment = exp.paymentMethod === 'Credit';
            if (filterPaymentStatus === 'Paid') matchesPayment = (exp.paymentMethod === 'Cash') || (exp.paymentMethod === 'Credit' && remaining <= 0);
            if (filterPaymentStatus === 'Unpaid') matchesPayment = exp.paymentMethod === 'Credit' && remaining > 0;

            let matchesDate = true;
            const expDate = new Date(exp.date).setHours(0,0,0,0);
            if (filterDateFrom) matchesDate = matchesDate && expDate >= new Date(filterDateFrom).setHours(0,0,0,0);
            if (filterDateTo) matchesDate = matchesDate && expDate <= new Date(filterDateTo).setHours(0,0,0,0);

            return matchesSearch && matchesCategory && matchesBeneficiaryType && matchesPayment && matchesDate;
        }).sort((a, b) => {
            if (b.date !== a.date) {
                return b.date - a.date;
            }
            // Fallback to ID-based timestamp sort for items on the same day
            const aTime = Number(a.id.substring(4));
            const bTime = Number(b.id.substring(4));
            return bTime - aTime;
        });
    }, [expenses, searchTerm, filterCategory, filterBeneficiaryType, filterPaymentStatus, filterDateFrom, filterDateTo, suppliers, workers, subcontractors]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
        setFilterBeneficiaryType('All');
        setFilterPaymentStatus('All');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const activeFilterCount = [
        filterCategory !== 'All', filterBeneficiaryType !== 'All', filterPaymentStatus !== 'All', filterDateFrom !== '', filterDateTo !== ''
    ].filter(Boolean).length;

    const summary = useMemo(() => {
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPaid = expenses.reduce((sum, e) => e.paymentMethod === 'Cash' ? sum + e.amount : sum + (e.paidAmount || 0), 0);
        const totalDebt = expenses.reduce((sum, e) => e.paymentMethod === 'Credit' ? sum + (e.amount - (e.paidAmount || 0)) : sum, 0);
        return { totalAmount, totalPaid, totalDebt };
    }, [expenses]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || !description) return;

        const beneficiaryType = 
            suppliers.some(s => s.id === beneficiaryId) ? 'Supplier' :
            workers.some(w => w.id === beneficiaryId) ? 'Worker' :
            subcontractors.some(s => s.id === beneficiaryId) ? 'Subcontractor' : undefined;

        const expenseData: any = {
            contractId: contract.id, amount: val, date: new Date(date).getTime(), description,
            category, paymentMethod, attachmentUrl: attachment, beneficiaryType,
            paidAmount: paymentMethod === 'Cash' ? val : 0,
        };

        if (beneficiaryType === 'Supplier') expenseData.supplierId = beneficiaryId;
        if (beneficiaryType === 'Worker') expenseData.workerId = beneficiaryId;
        if (beneficiaryType === 'Subcontractor') expenseData.subcontractorId = beneficiaryId;

        addExpense(expenseData);
        resetForm();
    };
    
    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setDescription('');
        setCategory('Material');
        setBeneficiaryId('');
        setPaymentMethod('Cash');
        setAttachment(undefined);
        if(descriptionInputRef.current) descriptionInputRef.current.focus();
    };

    // --- Inline Edit Functions ---
    const handleStartInlineEdit = (exp: Expense) => {
        if (inlineEditingId && inlineEditingId !== exp.id) {
            alert('يرجى حفظ أو إلغاء التعديل الحالي أولاً.');
            return;
        }
        setInlineEditingId(exp.id);
        setInlineEditData({
            ...exp,
            date: new Date(exp.date).toISOString().split('T')[0],
            beneficiaryId: exp.supplierId || exp.workerId || exp.subcontractorId || ''
        });
    };

    const handleCancelInlineEdit = () => {
        setInlineEditingId(null);
        setInlineEditData(null);
    };

    const handleSaveInlineEdit = () => {
        if (!inlineEditingId || !inlineEditData) return;
        
        const dataToSave: Partial<Expense> = { ...inlineEditData };
        dataToSave.amount = Number(dataToSave.amount);
        dataToSave.date = new Date(dataToSave.date).getTime();

        dataToSave.supplierId = undefined;
        dataToSave.workerId = undefined;
        dataToSave.subcontractorId = undefined;

        const beneficiaryType = 
            suppliers.some(s => s.id === inlineEditData.beneficiaryId) ? 'Supplier' :
            workers.some(w => w.id === inlineEditData.beneficiaryId) ? 'Worker' :
            subcontractors.some(s => s.id === inlineEditData.beneficiaryId) ? 'Subcontractor' : undefined;
        
        dataToSave.beneficiaryType = beneficiaryType;

        if (beneficiaryType === 'Supplier') dataToSave.supplierId = inlineEditData.beneficiaryId;
        if (beneficiaryType === 'Worker') dataToSave.workerId = inlineEditData.beneficiaryId;
        if (beneficiaryType === 'Subcontractor') dataToSave.subcontractorId = inlineEditData.beneficiaryId;
        
        delete (dataToSave as any).beneficiaryId;

        updateExpense(inlineEditingId, dataToSave);
        handleCancelInlineEdit();
    };

    const handleInlineDataChange = (field: keyof Expense | 'beneficiaryId', value: any) => {
        setInlineEditData((prev: any) => ({ ...prev, [field]: value }));
    };
    
    const handleInitPayment = (expense: Expense) => setPaymentExpense(expense);
    const handleConfirmPayment = (amount: number, dateStr: string, attachmentUrl?: string) => {
        if (paymentExpense && amount > 0) {
            payPartialDebt(paymentExpense, amount, new Date(dateStr).getTime(), attachmentUrl);
            setPaymentExpense(null);
        }
    };

    const handleViewHistory = (expense: Expense) => setHistoryExpense(expense);

    const formInputClass = "w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors placeholder:text-slate-500 placeholder:font-medium";

    return (
        <div className="p-4 space-y-4">
            <header className="mb-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-800">سجل المصاريف</h1>
                    <p className="text-xs text-slate-500">متابعة المصروفات والديون</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white rounded-lg border border-slate-200 p-2 text-center w-24 shadow-sm">
                        <p className="text-[9px] text-slate-500 font-bold">الكلي</p>
                        <h3 className="text-xs font-black text-slate-800 font-mono">{formatCurrency(summary.totalAmount)}</h3>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-2 text-center w-24 shadow-sm">
                        <p className="text-[9px] text-emerald-600 font-bold">المدفوع</p>
                        <h3 className="text-xs font-black text-emerald-700 font-mono">{formatCurrency(summary.totalPaid)}</h3>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-2 text-center w-24 shadow-sm">
                        <p className="text-[9px] text-amber-600 font-bold">الديون</p>
                        <h3 className="text-xs font-black text-amber-700 font-mono">{formatCurrency(summary.totalDebt)}</h3>
                    </div>
                </div>
            </header>
            
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
                    <input ref={descriptionInputRef} type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="الوصف*" className={`${formInputClass} lg:col-span-2`} />
                    <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ (IQD)*" className={`${formInputClass} font-mono`} />
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={`${formInputClass} font-mono`} />
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className={`${formInputClass} cursor-pointer`}>
                        <option value="Material">مواد</option><option value="Labor">أجور عمل</option><option value="Transport">نقل</option><option value="Other">نثرية / أخرى</option>
                    </select>
                    <select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)} className={`${formInputClass} cursor-pointer lg:col-span-2`}>
                        <option value="">-- اختر المستفيد --</option>
                        <optgroup label="موردين">{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
                        <optgroup label="مقاولين">{subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
                        <optgroup label="عمال">{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</optgroup>
                    </select>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className={`${formInputClass} cursor-pointer`}>
                        <option value="Cash">نقد (Cash)</option><option value="Credit">آجل (دين)</option>
                    </select>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-3">
                    <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-bold ${attachment ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                        <Icon name={attachment ? "check" : "image-plus"} size={14} />
                        <span>{attachment ? "تم إرفاق الوصل" : "إرفاق صورة"}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">مسح</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95 flex items-center gap-2">
                            <Icon name="plus" size={14} />
                            حفظ
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 transition-all duration-300">
                <div className="flex items-center justify-between p-3">
                    <div className="flex-1 relative max-w-lg">
                        <Icon name="search" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs font-bold focus:bg-white focus:border-primary-400 outline-none transition-all placeholder:text-slate-400" />
                    </div>
                    <div className="flex items-center gap-3 mr-4">
                        {activeFilterCount > 0 && (
                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
                                <span className="bg-primary-600 text-white w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                            </div>
                        )}
                        <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isFilterExpanded ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                            <Icon name="filter" size={12} /><span>فلترة</span><Icon name="chevron" size={12} className={`transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {isFilterExpanded && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200 rounded-b-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">الفترة الزمنية</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold outline-none focus:border-primary-400" />
                                    <span className="text-slate-400 font-bold text-xs">-</span>
                                    <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold outline-none focus:border-primary-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">التصنيف</label>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary-400 cursor-pointer">
                                    <option value="All">الكل</option><option value="Material">شراء مواد</option><option value="Labor">أجور عمل</option><option value="Transport">نقل وآليات</option><option value="Other">نثرية / أخرى</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">المستفيد</label>
                                <select value={filterBeneficiaryType} onChange={(e) => setFilterBeneficiaryType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary-400 cursor-pointer">
                                    <option value="All">الكل</option><option value="Supplier">موردين</option><option value="Subcontractor">مقاوليين</option><option value="Worker">عمال</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">الحالة</label>
                                <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary-400 cursor-pointer">
                                    <option value="All">الكل</option><option value="Cash">نقد (Cash)</option><option value="Credit">آجل (الكل)</option><option value="Paid">مدفوع بالكامل</option><option value="Unpaid">ديون مستحقة</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end border-t border-slate-200/50 pt-2">
                            <button onClick={resetFilters} className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                                <Icon name="trash" size={12} /> تصفية الكل
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-xs table-fixed">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-3 text-center w-10">#</th>
                            <th className="p-3 text-right w-auto">الوصف / المستفيد</th>
                            <th className="p-3 text-right w-24">التاريخ</th>
                            <th className="p-3 text-right w-24">التصنيف</th>
                            <th className="p-3 text-right w-28">المبلغ</th>
                            <th className="p-3 text-right w-24">المدفوع</th>
                            <th className="p-3 text-right w-24">المتبقي</th>
                            <th className="p-3 text-center w-24">الحالة</th>
                            <th className="p-3 text-left w-32">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredExpenses.map((exp, index) => {
                            const isInlineEditing = inlineEditingId === exp.id;
                            const paid = exp.paidAmount || 0;
                            const remaining = exp.paymentMethod === 'Credit' ? exp.amount - paid : 0;
                            const isPaidOff = exp.paymentMethod === 'Credit' && remaining <= 0;
                            const hasHistory = exp.paymentHistory && exp.paymentHistory.length > 0;

                            return isInlineEditing ? (
                                <tr key={exp.id} className="bg-blue-50/50">
                                    <td className="p-2 text-center text-blue-500 font-mono text-xs">{index + 1}</td>
                                    <td className="p-2">
                                        <div className="space-y-1">
                                            <input type="text" value={inlineEditData.description} onChange={(e) => handleInlineDataChange('description', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            <select value={inlineEditData.beneficiaryId} onChange={e => handleInlineDataChange('beneficiaryId', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                                                <option value="">-- المستفيد --</option>
                                                <optgroup label="موردين">{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
                                                <optgroup label="مقاولين">{subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
                                                <optgroup label="عمال">{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</optgroup>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-2 align-top"><input type="date" value={inlineEditData.date} onChange={e => handleInlineDataChange('date', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-[10px] font-mono bg-white focus:outline-none"/></td>
                                    <td className="p-2 align-top"><select value={inlineEditData.category} onChange={e => handleInlineDataChange('category', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-[10px] bg-white focus:outline-none"><option value="Material">مواد</option><option value="Labor">أجور عمل</option><option value="Transport">نقل</option><option value="Other">نثرية / أخرى</option></select></td>
                                    <td className="p-2 align-top"><input type="number" value={inlineEditData.amount} onChange={e => handleInlineDataChange('amount', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-xs font-mono font-bold bg-white focus:outline-none" /></td>
                                    <td className="p-2 align-top font-mono text-xs text-emerald-700 pt-3">{formatCurrency(paid)}</td>
                                    <td className="p-2 align-top font-mono text-xs text-amber-700 pt-3">{formatCurrency(Number(inlineEditData.amount) - paid)}</td>
                                    <td className="p-2 align-top"><select value={inlineEditData.paymentMethod} onChange={e => handleInlineDataChange('paymentMethod', e.target.value)} className="w-full p-1 border border-blue-300 rounded text-[10px] bg-white focus:outline-none"><option value="Cash">نقد</option><option value="Credit">آجل</option></select></td>
                                    <td className="p-2 text-left align-top">
                                        <div className="flex items-center justify-end gap-1 pt-1">
                                            <button onClick={handleSaveInlineEdit} title="حفظ" className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200"><Icon name="check" size={14} /></button>
                                            <button onClick={handleCancelInlineEdit} title="إلغاء" className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200"><Icon name="x" size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={exp.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="p-3 text-center text-slate-400 font-mono text-[10px]">{index + 1}</td>
                                    <td className="p-3">
                                        <div className="font-bold text-slate-800 text-xs truncate" title={exp.description}>{exp.description}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><Icon name="user" size={10} />{getBeneficiaryName(exp)}</div>
                                    </td>
                                    <td className="p-3 text-slate-500 text-[10px] font-mono whitespace-nowrap">{new Date(exp.date).toLocaleDateString('ar-IQ')}</td>
                                    <td className="p-3"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold">{exp.category}</span></td>
                                    <td className="p-3 font-mono font-bold text-slate-800">{formatCurrency(exp.amount)}</td>
                                    <td className="p-3 font-mono font-bold text-emerald-600">{exp.paymentMethod === 'Cash' ? formatCurrency(exp.amount) : formatCurrency(paid)}</td>
                                    <td className="p-3 font-mono font-bold">{remaining > 0 ? (<span className="text-amber-600">{formatCurrency(remaining)}</span>) : (<span className="text-slate-300">-</span>)}</td>
                                    <td className="p-3 text-center">
                                        {exp.paymentMethod === 'Cash' ? (<span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">نقد</span>)
                                        : isPaidOff ? (<span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200"><Icon name="check-simple" size={10} /> تم التسديد</span>)
                                        : (<span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200"><Icon name="alert" size={10} /> آجل</span>)}
                                    </td>
                                    <td className="p-3 text-left">
                                        <div className="flex items-center justify-end gap-1">
                                            {exp.paymentMethod === 'Credit' && (paid > 0 || hasHistory) && (
                                                <button onClick={() => handleViewHistory(exp)} className="text-purple-500 hover:text-purple-700 p-1.5 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors" title="سجل الدفعات"><Icon name="list" size={14} /></button>
                                            )}
                                            {exp.paymentMethod === 'Credit' && remaining > 0 && (
                                                <button onClick={() => handleInitPayment(exp)} className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors">تسديد</button>
                                            )}
                                            {exp.attachmentUrl && (
                                                <button onClick={() => setPreviewImage(exp.attachmentUrl || null)} className="text-indigo-400 hover:text-indigo-600 p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"><Icon name="image-plus" size={14} /></button>
                                            )}
                                            <button onClick={() => handleStartInlineEdit(exp)} className="text-blue-400 hover:text-blue-600 p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"><Icon name="pencil" size={14} /></button>
                                            <button onClick={() => { if(window.confirm('حذف هذا المصروف؟')) deleteExpense(exp.id) }} className="text-rose-300 hover:text-rose-500 p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"><Icon name="trash" size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredExpenses.length === 0 && (<tr><td colSpan={9} className="p-12 text-center text-slate-400"><div className="flex flex-col items-center gap-2"><Icon name="search" size={24} className="opacity-20" /><p>لا توجد مصاريف مطابقة للفلاتر</p></div></td></tr>)}
                    </tbody>
                </table>
            </div>

            {previewImage && (<div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><div className="relative max-w-4xl max-h-[90vh]"><img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" /><button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black hover:bg-slate-200"><Icon name="x" size={24} /></button></div></div>)}
            <PaymentModal isOpen={!!paymentExpense} expense={paymentExpense} remainingAmount={paymentExpense ? (paymentExpense.amount - (paymentExpense.paidAmount || 0)) : 0} onClose={() => setPaymentExpense(null)} onConfirm={handleConfirmPayment} />
            <PaymentHistoryModal isOpen={!!historyExpense} expense={historyExpense} onClose={() => setHistoryExpense(null)} />
        </div>
    );
};
