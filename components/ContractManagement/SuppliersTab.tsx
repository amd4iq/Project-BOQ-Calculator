
import React, { useState, useMemo, useEffect } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';
import { Supplier, Expense } from '../../types';

interface SuppliersTabProps {
    contractId?: string;
}

// --- Supplier Modal Component ---
const SupplierModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id'>) => void;
    onUpdate: (id: string, supplier: Partial<Supplier>) => void;
    initialData: Supplier | null;
}> = ({ isOpen, onClose, onSave, onUpdate, initialData }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setPhone(initialData.phone);
                setSpecialty(initialData.specialty);
                setAddress(initialData.address || '');
            } else {
                setName('');
                setPhone('');
                setSpecialty('');
                setAddress('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const supplierData = { name, phone, specialty: specialty || 'عام', address };

        if (initialData) {
            onUpdate(initialData.id, supplierData);
        } else {
            onSave(supplierData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Icon name="truck" className="text-indigo-600" />
                            {initialData ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم المورد / المكتب <span className="text-red-500">*</span></label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all font-bold text-slate-800" placeholder="مثال: مكتب النور" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">التخصص</label>
                            <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all" placeholder="مثال: مواد إنشائية" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">رقم الهاتف</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all font-mono text-sm" placeholder="07xxxxxxxxx" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">العنوان</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all" placeholder="المنطقة - الشارع" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">إلغاء</button>
                        <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                            {initialData ? 'حفظ التغييرات' : 'إضافة المورد'}
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
                <h3 className="font-bold text-lg text-slate-800 mb-1">تسديد دفعة (دين)</h3>
                <p className="text-xs text-slate-500 mb-4">
                    تسديد جزء أو كل المبلغ للمادة: <span className="font-bold text-indigo-600">{expense.description}</span>
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
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount} 
                                max={remainingAmount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-800 font-mono pl-10"
                                autoFocus
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">IQD</span>
                        </div>
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

export const SuppliersTab: React.FC<SuppliersTabProps> = ({ contractId }) => {
    const { suppliers, addSupplier, deleteSupplier, updateSupplier, getSupplierBalance, expenses, contracts, payPartialDebt, deleteExpense } = useContract();
    
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Selection & Preview State
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    // Filter suppliers
    const displayedSuppliers = useMemo(() => {
        let list = suppliers;
        if (contractId) {
            const usedIds = new Set(expenses.filter(e => e.contractId === contractId && e.supplierId).map(e => e.supplierId));
            list = list.filter(s => usedIds.has(s.id));
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            list = list.filter(s => 
                s.name.toLowerCase().includes(lowerTerm) || 
                s.phone.includes(searchTerm) ||
                s.specialty.toLowerCase().includes(lowerTerm)
            );
        }
        return list;
    }, [suppliers, expenses, contractId, searchTerm]);

    // Calculate Totals for Header
    const totals = useMemo(() => {
        let totalDebt = 0;
        displayedSuppliers.forEach(s => {
            if(contractId) {
                 totalDebt += expenses.filter(e => e.contractId === contractId && e.supplierId === s.id && e.paymentMethod === 'Credit')
                                      .reduce((acc, e) => acc + (e.amount - (e.paidAmount || 0)), 0);
            } else {
                totalDebt += getSupplierBalance(s.id);
            }
        });
        return { count: displayedSuppliers.length, totalDebt };
    }, [displayedSuppliers, contractId, expenses, getSupplierBalance]);


    const SupplierDetails: React.FC<{ supplier: Supplier; onEdit: () => void }> = ({ supplier, onEdit }) => {
        const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);
        const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
        const [filterDate, setFilterDate] = useState('');
        const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Credit'>('All');
        const [filterProject, setFilterProject] = useState<string>('All'); // New Filter

        const handleInitPayment = (expense: Expense) => setPaymentExpense(expense);
        const handleConfirmPayment = (amount: number, dateStr: string, attachmentUrl?: string) => {
            if (paymentExpense && amount > 0) {
                payPartialDebt(paymentExpense, amount, new Date(dateStr).getTime(), attachmentUrl);
                setPaymentExpense(null);
            }
        };

        const supplierExpenses = expenses.filter(e => e.supplierId === supplier.id);
        
        // Get Unique Projects for dropdown
        const uniqueProjects = useMemo(() => {
            const projectIds = Array.from(new Set(supplierExpenses.map(e => e.contractId)));
            return contracts.filter(c => projectIds.includes(c.id));
        }, [supplierExpenses, contracts]);

        // Apply Filters
        const filteredExpenses = useMemo(() => {
            let filtered = supplierExpenses;
            if (filterDate) filtered = filtered.filter(e => new Date(e.date).toISOString().split('T')[0] === filterDate);
            if (filterStatus !== 'All') {
                if (filterStatus === 'Paid') filtered = filtered.filter(e => e.paymentMethod === 'Cash' || (e.paymentMethod === 'Credit' && (e.amount - (e.paidAmount||0)) === 0));
                else if (filterStatus === 'Credit') filtered = filtered.filter(e => e.paymentMethod === 'Credit');
            }
            if (filterProject !== 'All') {
                filtered = filtered.filter(e => e.contractId === filterProject);
            }
            return filtered.sort((a, b) => b.date - a.date);
        }, [supplierExpenses, filterDate, filterStatus, filterProject]);

        const totalTransactions = supplierExpenses.filter(e => e.category !== 'DebtPayment').reduce((sum, e) => sum + e.amount, 0);
        const totalPaid = supplierExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
        const totalBalance = getSupplierBalance(supplier.id); 

        const linkedProjects = useMemo(() => {
            const projectIds = Array.from(new Set(supplierExpenses.map(e => e.contractId)));
            const activeProjects = contracts.filter(c => projectIds.includes(c.id));
            
            return activeProjects.map(proj => {
                const projExpenses = supplierExpenses.filter(e => e.contractId === proj.id);
                const supply = projExpenses.filter(e => e.category !== 'DebtPayment').reduce((sum, e) => sum + e.amount, 0);
                const paid = projExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
                const debt = supply - paid;
                return { ...proj, supply, paid, debt };
            });
        }, [supplierExpenses, contracts]);
        
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 p-6">
                <div className="flex justify-between items-center">
                    <button onClick={() => setSelectedSupplierId(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-bold transition-colors">
                        <div className="p-1 bg-white rounded-md border shadow-sm"><Icon name="chevron" size={16} className="rotate-90" /></div>
                        العودة للقائمة
                    </button>
                    <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                        <Icon name="pencil" size={14} /> تعديل البيانات
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Icon name="truck" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800">{supplier.name}</h2>
                            <p className="text-xs text-slate-500 font-medium">{supplier.specialty}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t md:border-t-0 md:border-r border-slate-100 pt-3 md:pt-0 md:pr-4">
                        <span className="flex items-center gap-1.5"><Icon name="phone" size={14} className="text-slate-400"/> {supplier.phone || 'غير مدخل'}</span>
                        <span className="flex items-center gap-1.5"><Icon name="home" size={14} className="text-slate-400"/> {supplier.address || 'العنوان غير محدد'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs text-slate-500 font-bold mb-1">إجمالي التوريدات</p><p className="text-lg font-black text-slate-800 font-mono">{formatCurrency(totalTransactions)}</p></div>
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Icon name="truck" size={20} /></div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs text-emerald-600 font-bold mb-1">المبلغ المدفوع</p><p className="text-lg font-black text-emerald-700 font-mono">{formatCurrency(totalPaid)}</p></div>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Icon name="check" size={20} /></div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs text-rose-600 font-bold mb-1">الديون المتبقية</p><p className="text-lg font-black text-rose-700 font-mono">{formatCurrency(totalBalance)}</p></div>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Icon name="alert" size={20} /></div>
                    </div>
                </div>

                {linkedProjects.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => setIsProjectsExpanded(!isProjectsExpanded)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2"><Icon name="briefcase" size={18} className="text-slate-500" /><h3 className="font-bold text-slate-700 text-sm">المشاريع المرتبطة وملخصاتها</h3><span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{linkedProjects.length}</span></div>
                            <Icon name="chevron" size={20} className={`text-slate-400 transition-transform duration-200 ${isProjectsExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isProjectsExpanded && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {linkedProjects.map(proj => {
                                        const percentage = proj.supply > 0 ? (proj.paid / proj.supply) * 100 : 0;
                                        return (
                                            <div key={proj.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${proj.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                        <h4 className="font-bold text-slate-800 text-sm truncate max-w-[180px]">{proj.projectDetails.projectName}</h4>
                                                    </div>
                                                    {proj.id === contractId && <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">الحالي</span>}
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Financials Row */}
                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        <div className="bg-slate-50 p-2 rounded-xl">
                                                            <span className="block text-[10px] text-slate-500 mb-1">التوريد</span>
                                                            <span className="block font-mono font-bold text-slate-800 text-xs">{formatCurrency(proj.supply)}</span>
                                                        </div>
                                                        <div className="bg-emerald-50 p-2 rounded-xl">
                                                            <span className="block text-[10px] text-emerald-600 mb-1">المدفوع</span>
                                                            <span className="block font-mono font-bold text-emerald-700 text-xs">{formatCurrency(proj.paid)}</span>
                                                        </div>
                                                        <div className="bg-rose-50 p-2 rounded-xl">
                                                            <span className="block text-[10px] text-rose-600 mb-1">المتبقي</span>
                                                            <span className="block font-mono font-bold text-rose-700 text-xs">{formatCurrency(proj.debt)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="relative pt-1">
                                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium">
                                                            <span>نسبة السداد</span>
                                                            <span>{percentage.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Icon name="file-text" size={16} />سجل الحركات المالية</h3>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {/* Project Filter */}
                            <select 
                                value={filterProject} 
                                onChange={(e) => setFilterProject(e.target.value)} 
                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-indigo-400 max-w-[150px]"
                            >
                                <option value="All">كل المشاريع</option>
                                {uniqueProjects.map(proj => (
                                    <option key={proj.id} value={proj.id}>{proj.projectDetails.projectName}</option>
                                ))}
                            </select>

                            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-indigo-400 font-mono" />
                            
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-indigo-400">
                                <option value="All">كل الحالات</option>
                                <option value="Paid">مدفوع / تسديد</option>
                                <option value="Credit">آجل (دين)</option>
                            </select>
                            
                            {(filterDate || filterStatus !== 'All' || filterProject !== 'All') && (<button onClick={() => { setFilterDate(''); setFilterStatus('All'); setFilterProject('All'); }} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg" title="إلغاء الفلتر"><Icon name="x" size={14} /></button>)}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="p-3 text-center w-10">#</th>
                                    <th className="p-3 text-right">التاريخ</th>
                                    <th className="p-3 text-right">الوصف</th>
                                    <th className="p-3 text-right">المشروع</th>
                                    <th className="p-3 text-right">المبلغ الكلي</th>
                                    <th className="p-3 text-right">المدفوع</th>
                                    <th className="p-3 text-right">المتبقي</th>
                                    <th className="p-3 text-center">الحالة</th>
                                    <th className="p-3 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExpenses.map((exp, index) => {
                                    const paid = exp.paidAmount || 0;
                                    const remaining = exp.paymentMethod === 'Credit' ? exp.amount - paid : 0;
                                    const isPaidOff = exp.paymentMethod === 'Credit' && remaining <= 0;
                                    
                                    const projectName = contracts.find(c => c.id === exp.contractId)?.projectDetails.projectName || 'مشروع غير معروف';

                                    return (
                                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                                        <td className="p-3 text-slate-500 text-xs font-mono whitespace-nowrap">{new Date(exp.date).toLocaleDateString('ar-IQ')}</td>
                                        <td className="p-3 font-bold text-slate-800">
                                            {exp.description}
                                        </td>
                                        <td className="p-3 text-indigo-600 font-bold text-xs whitespace-nowrap flex items-center gap-1">
                                            <Icon name="briefcase" size={12} className="text-indigo-400" />
                                            {projectName}
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-800">{formatCurrency(exp.amount)}</td>
                                        <td className="p-3 font-mono font-bold text-emerald-600">
                                            {exp.paymentMethod === 'Cash' ? formatCurrency(exp.amount) : formatCurrency(paid)}
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                            {remaining > 0 ? (
                                                <span className="text-amber-600">{formatCurrency(remaining)}</span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {exp.paymentMethod === 'Cash' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                    نقد (Cash)
                                                </span>
                                            ) : isPaidOff ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    <Icon name="check-simple" size={12} /> تم التسديد
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                                    <Icon name="alert" size={12} /> آجل (دين)
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                {exp.paymentMethod === 'Credit' && remaining > 0 && (
                                                    <button 
                                                        onClick={() => handleInitPayment(exp)}
                                                        className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                                                    >
                                                        تسديد <Icon name="chevron" size={10} className="rotate-90" />
                                                    </button>
                                                )}
                                                {exp.attachmentUrl && (
                                                    <button onClick={() => setPreviewImage(exp.attachmentUrl || null)} className="text-indigo-400 hover:text-indigo-600 p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <Icon name="image-plus" size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => { if(window.confirm('حذف هذا المصروف؟')) deleteExpense(exp.id) }} className="text-rose-300 hover:text-rose-500 p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Icon name="trash" size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                                {filteredExpenses.length === 0 && (<tr><td colSpan={9} className="p-8 text-center text-slate-400">لا توجد حركات مطابقة للفلاتر</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <PaymentModal isOpen={!!paymentExpense} expense={paymentExpense} remainingAmount={paymentExpense ? (paymentExpense.amount - (paymentExpense.paidAmount || 0)) : 0} onClose={() => setPaymentExpense(null)} onConfirm={handleConfirmPayment} />
            </div>
        );
    };

    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

    return (
        <div className="space-y-6">
            {selectedSupplier ? (
                <SupplierDetails supplier={selectedSupplier} onEdit={() => handleOpenEdit(selectedSupplier)} />
            ) : (
                <>
                    {!contractId ? (
                        <div className="space-y-6">
                            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-800 leading-tight">قاعدة الموردين</h1>
                                    <p className="text-slate-500 mt-1">إدارة الموردين وكشف الحسابات</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Icon name="search" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث عن مورد..." className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-indigo-400 w-64 shadow-sm"/>
                                    </div>
                                    <button onClick={handleOpenAdd} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all"><Icon name="plus" size={18} /> إضافة مورد</button>
                                </div>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 relative overflow-hidden">
                                    <div className="relative z-10"><p className="text-indigo-100 text-xs font-bold mb-1">إجمالي الموردين</p><h3 className="text-3xl font-black">{totals.count}</h3></div>
                                    <Icon name="users" size={64} className="absolute -left-4 -bottom-4 text-indigo-500 opacity-30" />
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div><p className="text-slate-500 text-xs font-bold mb-1">إجمالي الديون المستحقة</p><h3 className="text-2xl font-black text-rose-600">{formatCurrency(totals.totalDebt)}</h3></div>
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Icon name="alert" size={24} /></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div><p className="text-slate-500 text-xs font-bold mb-1">الموردين النشطين</p><h3 className="text-2xl font-black text-slate-800">{displayedSuppliers.length}</h3><p className="text-[10px] text-slate-400 mt-1">مطابق للبحث</p></div>
                                    <div className="p-3 bg-slate-100 text-slate-500 rounded-xl"><Icon name="filter" size={24} /></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <header className="mb-6 flex justify-between items-center">
                                <div><h1 className="text-2xl font-black text-slate-800">الموردين المرتبطين</h1><p className="text-slate-500 text-sm">الموردين الذين تم التعامل معهم في هذا المشروع</p></div>
                                <button onClick={handleOpenAdd} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm flex items-center gap-2"><Icon name="plus" size={16} /> إضافة مورد جديد</button>
                            </header>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mx-6 mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-right">المورد</th>
                                    <th className="p-4 text-right">التخصص</th>
                                    <th className="p-4 text-right">رقم الهاتف</th>
                                    {contractId && <th className="p-4 text-right">إجمالي التوريد</th>}
                                    {contractId && <th className="p-4 text-right">المدفوع</th>}
                                    <th className="p-4 text-right">الديون المتبقية</th>
                                    <th className="p-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedSuppliers.map(supplier => {
                                    let balance = 0;
                                    let projectTotal = 0;
                                    let projectPaid = 0;

                                    if (contractId) {
                                        const projExpenses = expenses.filter(e => e.contractId === contractId && e.supplierId === supplier.id);
                                        projectTotal = projExpenses.filter(e => e.category !== 'DebtPayment').reduce((acc, curr) => acc + curr.amount, 0);
                                        projectPaid = projExpenses.reduce((acc, curr) => acc + (curr.paymentMethod === 'Cash' ? curr.amount : (curr.paidAmount || 0)), 0);
                                        
                                        // Balance is strictly Sum of (Credit Amount - Paid Amount)
                                        balance = projExpenses
                                            .filter(e => e.paymentMethod === 'Credit')
                                            .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);
                                    } else {
                                        balance = getSupplierBalance(supplier.id);
                                    }

                                    return (
                                        <tr key={supplier.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedSupplierId(supplier.id)}>
                                            <td className="p-4"><div className="font-bold text-slate-800">{supplier.name}</div>{supplier.address && <div className="text-[10px] text-slate-400 mt-0.5">{supplier.address}</div>}</td>
                                            <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{supplier.specialty}</span></td>
                                            <td className="p-4 text-slate-500 font-mono text-xs">{supplier.phone || '-'}</td>
                                            {contractId && <td className="p-4 font-mono font-bold text-slate-700">{formatCurrency(projectTotal)}</td>}
                                            {contractId && <td className="p-4 font-mono font-bold text-emerald-600">{formatCurrency(projectPaid)}</td>}
                                            <td className="p-4">{balance > 0 ? (<span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">{formatCurrency(balance)}</span>) : (<span className="text-slate-400 font-mono font-bold">0</span>)}</td>
                                            <td className="p-4 text-left">
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-slate-400 group-hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg" title="عرض التفاصيل"><Icon name="file-text" size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(supplier); }} className="text-slate-400 group-hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100" title="تعديل"><Icon name="pencil" size={16} /></button>
                                                    {!contractId && (<button onClick={(e) => { e.stopPropagation(); if(window.confirm('حذف هذا المورد؟')) deleteSupplier(supplier.id) }} className="text-slate-400 group-hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100" title="حذف"><Icon name="trash" size={16} /></button>)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {displayedSuppliers.length === 0 && (<tr><td colSpan={contractId ? 7 : 5} className="p-12 text-center text-slate-400">لا يوجد موردين</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addSupplier} onUpdate={updateSupplier} initialData={editingSupplier} />
            {previewImage && (<div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><div className="relative max-w-4xl max-h-[90vh]"><img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" /><button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black hover:bg-slate-200"><Icon name="x" size={24} /></button></div></div>)}
        </div>
    );
};
