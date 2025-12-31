
import React, { useState, useMemo, useEffect } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';
import { Worker, Expense, Contract } from '../../types';

interface LaborTabProps {
    contractId?: string;
}

// --- Worker Modal Component ---
const WorkerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (workerData: any) => void;
    onUpdate: (id: string, workerData: Partial<Worker>) => void;
    initialData: Worker | null;
    contracts: Contract[];
    fixedContractId?: string;
}> = ({ isOpen, onClose, onSave, onUpdate, initialData, contracts, fixedContractId }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [dailyWage, setDailyWage] = useState('');
    const [address, setAddress] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(fixedContractId || '');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setPhone(initialData.phone);
                setRole(initialData.role);
                setDailyWage(initialData.dailyWage.toString());
                setAddress(initialData.address || '');
            } else {
                setName('');
                setPhone('');
                setRole('');
                setDailyWage('');
                setAddress('');
                setSelectedProjectId(fixedContractId || '');
            }
        }
    }, [isOpen, initialData, fixedContractId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        if (!initialData && !selectedProjectId) {
            alert("يجب ربط العامل بمشروع جاري تنفيذه.");
            return;
        }

        const workerData = { 
            name, 
            phone, 
            role: role || 'عام', 
            dailyWage: parseFloat(dailyWage) || 0,
            address
        };

        if (initialData) {
            onUpdate(initialData.id, workerData);
        } else {
            onSave({ ...workerData, linkedContractId: selectedProjectId });
        }
        onClose();
    };

    const activeContracts = contracts.filter(c => c.status === 'Active');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Icon name="user" className="text-primary-600" />
                            {initialData ? 'تعديل بيانات العامل' : 'إضافة عامل جديد'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {!initialData && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="text-xs font-bold text-slate-600 mb-2 block flex items-center gap-2">
                                <Icon name="briefcase" size={14} />
                                المشروع الحالي (إجباري)
                            </label>
                            {fixedContractId ? (
                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                    <Icon name="lock" size={14} className="text-slate-400"/>
                                    {contracts.find(c => c.id === fixedContractId)?.projectDetails.projectName}
                                </div>
                            ) : (
                                <select 
                                    required 
                                    value={selectedProjectId} 
                                    onChange={e => setSelectedProjectId(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-200 font-bold text-sm"
                                >
                                    <option value="">-- اختر المشروع الجاري --</option>
                                    {activeContracts.map(c => (
                                        <option key={c.id} value={c.id}>{c.projectDetails.projectName}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم العامل <span className="text-red-500">*</span></label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-slate-800" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الصفة</label>
                            <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all" placeholder="مثال: خلفة سيراميك" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الأجر اليومي (IQD)</label>
                            <input type="number" value={dailyWage} onChange={e => setDailyWage(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all font-mono font-bold" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">رقم الهاتف</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all font-mono text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">العنوان</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">إلغاء</button>
                        <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95">
                            {initialData ? 'حفظ التغييرات' : 'إضافة العامل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Payment Modal Component ---
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

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-1">تسديد أجور (دين)</h3>
                <p className="text-xs text-slate-500 mb-4">
                    تسديد جزء أو كل المبلغ: <span className="font-bold text-indigo-600">{expense.description}</span>
                </p>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">تاريخ التسديد</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">المبلغ المراد تسديده (IQD)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            max={remainingAmount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-800 font-mono"
                            autoFocus
                        />
                        <p className="text-[10px] text-slate-400 mt-1 text-left font-mono">
                            المتبقي من الدين: {formatCurrency(remainingAmount)}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">صورة الوصل (اختياري)</label>
                        <p className="text-[10px] text-slate-400 mb-1">إذا لم ترفق صورة، سيتم استخدام صورة الوصل الأصلي.</p>
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-400 text-slate-600 p-2.5 rounded-xl transition-colors border-dashed">
                            <Icon name={attachment ? "check" : "image-plus"} size={16} className={attachment ? "text-emerald-500" : ""} />
                            <span className="text-xs font-bold">{attachment ? "تم ارفاق صورة" : "اضغط لرفع وصل التسديد"}</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200">إلغاء</button>
                    <button 
                        onClick={() => onConfirm(amount, date, attachment)}
                        disabled={amount <= 0 || amount > remainingAmount}
                        className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                    >
                        تأكيد التسديد
                    </button>
                </div>
            </div>
        </div>
    );
};

export const LaborTab: React.FC<LaborTabProps> = ({ contractId }) => {
    const { workers, addWorker, deleteWorker, updateWorker, getWorkerBalance, expenses, contracts, payPartialDebt } = useContract();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Logic
    const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);

    const handleOpenAdd = () => {
        setEditingWorker(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (worker: Worker) => {
        setEditingWorker(worker);
        setIsModalOpen(true);
    };

    const handleSaveWorker = (data: any) => {
        addWorker({ 
            name: data.name, 
            phone: data.phone, 
            role: data.role, 
            dailyWage: data.dailyWage,
            address: data.address
        });
    };

    const displayedWorkers = useMemo(() => {
        let list = workers;
        if (contractId) {
            const usedIds = new Set(expenses.filter(e => e.contractId === contractId && e.workerId).map(e => e.workerId));
            list = list.filter(w => usedIds.has(w.id));
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(w => 
                w.name.toLowerCase().includes(term) || 
                w.role.toLowerCase().includes(term) ||
                w.phone.includes(term)
            );
        }
        return list;
    }, [workers, expenses, contractId, searchTerm]);

    // Calculate Global Totals for Header
    const totals = useMemo(() => {
        let totalDue = 0;
        displayedWorkers.forEach(w => {
            if(contractId) {
                 totalDue += expenses.filter(e => e.contractId === contractId && e.workerId === w.id && e.paymentMethod === 'Credit')
                                     .reduce((acc, e) => acc + (e.amount - (e.paidAmount || 0)), 0);
            } else {
                totalDue += getWorkerBalance(w.id);
            }
        });
        return { count: displayedWorkers.length, totalDue };
    }, [displayedWorkers, contractId, expenses, getWorkerBalance]);

    // --- Worker Profile Component ---
    const WorkerProfile: React.FC<{ worker: Worker; onEdit: () => void }> = ({ worker, onEdit }) => {
        const [isProjectsExpanded, setIsProjectsExpanded] = useState(false); // New state

        const workerExpenses = expenses.filter(e => e.workerId === worker.id);
        
        // Earned = Total Work Value (not Debt Payments)
        const totalEarned = workerExpenses.filter(e => e.category !== 'DebtPayment').reduce((sum, e) => sum + e.amount, 0); 
        const totalPaid = workerExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
        const balance = getWorkerBalance(worker.id);

        const linkedProjects = useMemo(() => {
            const projectIds = Array.from(new Set(workerExpenses.map(e => e.contractId)));
            const activeContractsList = contracts.filter(c => projectIds.includes(c.id));

            return activeContractsList.map(proj => {
                const projExpenses = workerExpenses.filter(e => e.contractId === proj.id);
                const projEarned = projExpenses.filter(e => e.category !== 'DebtPayment').reduce((sum, e) => sum + e.amount, 0);
                const projPaid = projExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
                const projRemaining = projEarned - projPaid;
                return { ...proj, projEarned, projPaid, projRemaining };
            });
        }, [workerExpenses, contracts]);

        const handleInitPayment = (expense: Expense) => {
            setPaymentExpense(expense);
        };

        const handleConfirmPayment = (amount: number, dateStr: string, attachmentUrl?: string) => {
            if (paymentExpense && amount > 0) {
                const dateObj = new Date(dateStr);
                payPartialDebt(paymentExpense, amount, dateObj.getTime(), attachmentUrl);
                setPaymentExpense(null);
            }
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 p-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={() => setSelectedWorkerId(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-bold transition-colors">
                        <div className="p-1 bg-white rounded-md border shadow-sm"><Icon name="chevron" size={16} className="rotate-90" /></div>
                        العودة للقائمة
                    </button>
                    <button onClick={onEdit} className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors">
                        <Icon name="pencil" size={14} /> تعديل البيانات
                    </button>
                </div>

                {/* Compact Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Icon name="user" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800">{worker.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{worker.role}</span>
                                <span className="text-emerald-600 font-bold text-xs font-mono">{formatCurrency(worker.dailyWage)} IQD/يوم</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t md:border-t-0 md:border-r border-slate-100 pt-3 md:pt-0 md:pr-4">
                        <span className="flex items-center gap-1.5"><Icon name="phone" size={14} className="text-slate-400"/> {worker.phone || 'غير مدخل'}</span>
                        <span className="flex items-center gap-1.5"><Icon name="home" size={14} className="text-slate-400"/> {worker.address || 'العنوان غير محدد'}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-bold mb-1">إجمالي العمل المنجز</p>
                            <p className="text-lg font-black text-slate-800 font-mono">{formatCurrency(totalEarned)}</p>
                        </div>
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Icon name="user" size={20} /></div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-600 font-bold mb-1">الأجور المدفوعة</p>
                            <p className="text-lg font-black text-emerald-700 font-mono">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Icon name="check" size={20} /></div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-rose-600 font-bold mb-1">الأجور المستحقة</p>
                            <p className="text-lg font-black text-rose-700 font-mono">{formatCurrency(balance)}</p>
                        </div>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Icon name="alert" size={20} /></div>
                    </div>
                </div>

                {/* Linked Projects Summary - COLLAPSIBLE DROPDOWN */}
                {linkedProjects.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Icon name="briefcase" size={18} className="text-slate-500" />
                                <h3 className="font-bold text-slate-700 text-sm">المشاريع المرتبطة وملخصاتها</h3>
                                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{linkedProjects.length}</span>
                            </div>
                            <Icon name="chevron" size={20} className={`text-slate-400 transition-transform duration-200 ${isProjectsExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isProjectsExpanded && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {linkedProjects.map(proj => (
                                        <div key={proj.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${proj.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{proj.projectDetails.projectName}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg text-[10px]">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">العمل المنجز</span>
                                                    <span className="font-mono font-bold text-slate-800">{formatCurrency(proj.projEarned)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">المدفوع</span>
                                                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(proj.projPaid)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-slate-200 pt-1">
                                                    <span className="text-slate-500">المستحق</span>
                                                    <span className="font-mono font-bold text-rose-600">{formatCurrency(proj.projRemaining)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Icon name="file-text" size={16} />
                            سجل الحركات المالية
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-right">التاريخ</th>
                                    <th className="p-3 text-right">المشروع</th>
                                    <th className="p-3 text-right">الوصف</th>
                                    <th className="p-3 text-right">المبلغ</th>
                                    <th className="p-3 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {workerExpenses.slice().reverse().map(exp => {
                                    const paidAmount = exp.paidAmount || 0;
                                    const remaining = exp.paymentMethod === 'Credit' ? exp.amount - paidAmount : 0;
                                    
                                    return (
                                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{new Date(exp.date).toLocaleDateString('en-GB')}</td>
                                        <td className="p-3 text-indigo-600 font-bold whitespace-nowrap">
                                            {contracts.find(c => c.id === exp.contractId)?.projectDetails.projectName}
                                        </td>
                                        <td className="p-3 text-slate-700 font-medium">{exp.description}</td>
                                        <td className="p-3 font-mono font-bold text-slate-800">{formatCurrency(exp.amount)}</td>
                                        <td className="p-3 text-center">
                                            {exp.category === 'DebtPayment' 
                                                ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">تسديد قديم</span>
                                                : exp.paymentMethod === 'Cash' 
                                                    ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">مدفوع</span>
                                                    : remaining <= 0 ? (
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 text-[10px] font-bold w-full justify-center">
                                                            <Icon name="check-simple" size={14} /> تم التسديد
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleInitPayment(exp)}
                                                            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 hover:border-amber-300 font-bold transition-all text-[10px] shadow-sm w-full justify-center"
                                                        >
                                                            {paidAmount > 0 ? `تسديد المتبقي (${formatCurrency(remaining)})` : 'تسديد'}
                                                            <Icon name="chevron" size={10} className="rotate-90" />
                                                        </button>
                                                    )
                                            }
                                        </td>
                                    </tr>
                                )})}
                                {workerExpenses.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">لا توجد حركات مسجلة</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PaymentModal 
                    isOpen={!!paymentExpense}
                    expense={paymentExpense}
                    remainingAmount={paymentExpense ? (paymentExpense.amount - (paymentExpense.paidAmount || 0)) : 0}
                    onClose={() => setPaymentExpense(null)}
                    onConfirm={handleConfirmPayment}
                />
            </div>
        );
    };

    const selectedWorker = workers.find(w => w.id === selectedWorkerId);

    return (
        <div className="space-y-6">
            {selectedWorker ? (
                <WorkerProfile worker={selectedWorker} onEdit={() => handleOpenEdit(selectedWorker)} />
            ) : (
                <>
                    {!contractId ? (
                        <div className="space-y-6">
                            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-800 leading-tight">سجل العمال</h1>
                                    <p className="text-slate-500 mt-1">إدارة العمال، الأجور اليومية، والحضور</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Icon name="search" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="بحث عن عامل..." 
                                            className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-primary-400 w-64 shadow-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleOpenAdd}
                                        className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200 active:scale-95 transition-all"
                                    >
                                        <Icon name="plus" size={18} />
                                        إضافة عامل
                                    </button>
                                </div>
                            </header>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-primary-600 text-white p-6 rounded-2xl shadow-lg shadow-primary-200 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-primary-100 text-xs font-bold mb-1">إجمالي العمال</p>
                                        <h3 className="text-3xl font-black">{totals.count}</h3>
                                    </div>
                                    <Icon name="users" size={64} className="absolute -left-4 -bottom-4 text-primary-500 opacity-30" />
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold mb-1">الأجور المستحقة</p>
                                        <h3 className="text-2xl font-black text-rose-600">{formatCurrency(totals.totalDue)}</h3>
                                    </div>
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Icon name="alert" size={24} /></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold mb-1">العمال النشطين</p>
                                        <h3 className="text-2xl font-black text-slate-800">{displayedWorkers.length}</h3>
                                        <p className="text-[10px] text-slate-400 mt-1">مطابق للبحث</p>
                                    </div>
                                    <div className="p-3 bg-slate-100 text-slate-500 rounded-xl"><Icon name="filter" size={24} /></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <header className="mb-6 flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-800">العمال والحرفيين</h1>
                                    <p className="text-slate-500 text-sm">قائمة العمال الذين عملوا في هذا المشروع</p>
                                </div>
                                <button 
                                    onClick={handleOpenAdd}
                                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm flex items-center gap-2"
                                >
                                    <Icon name="plus" size={16} />
                                    إضافة عامل جديد
                                </button>
                            </header>
                        </div>
                    )}

                    {/* Table View */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mx-6 mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-right">الاسم</th>
                                    <th className="p-4 text-right">الصفة</th>
                                    <th className="p-4 text-right">رقم الهاتف</th>
                                    <th className="p-4 text-right">الأجر اليومي</th>
                                    {contractId && <th className="p-4 text-right">إجمالي العمل</th>}
                                    <th className="p-4 text-right">المستحق</th>
                                    <th className="p-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedWorkers.map(worker => {
                                    let projectTotal = 0;
                                    let balance = 0;

                                    if (contractId) {
                                        const projectExpenses = expenses.filter(e => e.contractId === contractId && e.workerId === worker.id);
                                        projectTotal = projectExpenses.filter(e => e.category !== 'DebtPayment').reduce((acc, curr) => acc + curr.amount, 0);
                                        const projectPaid = projectExpenses.reduce((acc, curr) => acc + (curr.paymentMethod === 'Cash' ? curr.amount : (curr.paidAmount || 0)), 0);
                                        balance = projectTotal - projectPaid;
                                    } else {
                                        balance = getWorkerBalance(worker.id);
                                    }

                                    return (
                                        <tr key={worker.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setSelectedWorkerId(worker.id)}>
                                            <td className="p-4 font-bold text-slate-700">{worker.name}</td>
                                            <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{worker.role}</span></td>
                                            <td className="p-4 text-slate-500 font-mono text-xs">{worker.phone || '-'}</td>
                                            <td className="p-4 font-mono text-slate-600">{formatCurrency(worker.dailyWage)}</td>
                                            {contractId && <td className="p-4 font-mono font-bold text-slate-700">{formatCurrency(projectTotal)}</td>}
                                            <td className="p-4">
                                                {balance > 0 ? (
                                                    <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">{formatCurrency(balance)}</span>
                                                ) : (
                                                    <span className="text-slate-400 font-mono font-bold">0</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-left">
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-slate-400 group-hover:text-primary-600 transition-colors p-2 hover:bg-primary-50 rounded-lg" title="التفاصيل"><Icon name="file-text" size={16} /></button>
                                                    {!contractId && (
                                                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('حذف هذا العامل؟')) deleteWorker(worker.id) }} className="text-slate-400 group-hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100" title="حذف"><Icon name="trash" size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {displayedWorkers.length === 0 && <tr><td colSpan={contractId ? 7 : 6} className="p-12 text-center text-slate-400">لا يوجد عمال</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <WorkerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveWorker}
                onUpdate={updateWorker}
                initialData={editingWorker}
                contracts={contracts}
                fixedContractId={contractId}
            />
        </div>
    );
};
