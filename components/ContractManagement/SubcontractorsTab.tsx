
import React, { useState, useMemo, useEffect } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';
import { Subcontractor, Contract, Expense } from '../../types';

interface SubcontractorsTabProps {
    contractId?: string;
}

// --- Modal Component ---
const SubcontractorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (subData: any) => void;
    onUpdate: (id: string, subData: Partial<Subcontractor>) => void;
    initialData: Subcontractor | null;
    contracts: Contract[];
    fixedContractId?: string;
}> = ({ isOpen, onClose, onSave, onUpdate, initialData, contracts, fixedContractId }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [contractVal, setContractVal] = useState('');
    const [duration, setDuration] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(fixedContractId || '');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setPhone(initialData.phone);
                setSpecialty(initialData.specialty);
                setCompanyName(initialData.companyName || '');
                setAddress(initialData.address || '');
                setContractVal(initialData.defaultContractValue?.toString() || '');
            } else {
                setName('');
                setPhone('');
                setSpecialty('');
                setCompanyName('');
                setAddress('');
                setContractVal('');
                setDuration('');
                setSelectedProjectId(fixedContractId || '');
            }
        }
    }, [isOpen, initialData, fixedContractId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        
        if (!initialData && !selectedProjectId) {
            alert("يجب ربط المقاول بمشروع جاري تنفيذه لإنشاء العقد.");
            return;
        }

        const subData: any = {
            name,
            phone,
            specialty,
            companyName,
            address,
            defaultContractValue: parseFloat(contractVal) || 0
        };

        if (initialData) {
            onUpdate(initialData.id, subData);
        } else {
            onSave({
                ...subData,
                linkedContractId: selectedProjectId,
                initialDuration: parseFloat(duration) || 0
            });
        }
        onClose();
    };

    const activeContracts = contracts.filter(c => c.status === 'Active');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Icon name="building" className="text-blue-600" />
                            {initialData ? 'تعديل بيانات المقاول' : 'إضافة مقاول وإنشاء عقد'}
                        </h2>
                        {!initialData && <p className="text-xs text-slate-500 mt-1">سيتم إنشاء عقد ثانوي جديد وربطه بالمشروع المختار.</p>}
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="subForm" onSubmit={handleSubmit} className="space-y-6">
                        {!initialData && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="text-xs font-bold text-blue-800 mb-2 block flex items-center gap-2">
                                    <Icon name="briefcase" size={14} />
                                    المشروع المراد التعاقد عليه (إجباري)
                                </label>
                                {fixedContractId ? (
                                    <div className="font-bold text-slate-800 flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200">
                                        <Icon name="lock" size={14} className="text-slate-400"/>
                                        {contracts.find(c => c.id === fixedContractId)?.projectDetails.projectName}
                                    </div>
                                ) : (
                                    <select 
                                        required 
                                        value={selectedProjectId} 
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 font-bold text-sm"
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
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم المقاول <span className="text-red-500">*</span></label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">التخصص</label>
                                <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" placeholder="مثال: كهرباء" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم الشركة (اختياري)</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">رقم الهاتف</label>
                                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-mono text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">العنوان</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">قيمة العقد (IQD)</label>
                                <input type="number" value={contractVal} onChange={e => setContractVal(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-mono font-bold" placeholder="0" />
                                <p className="text-[10px] text-slate-400 mt-1">سيتم ربط هذه القيمة بالمشروع المختار أعلاه.</p>
                            </div>
                            {!initialData && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">مدة التنفيذ (يوم)</label>
                                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-mono font-bold" placeholder="0" />
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">إلغاء</button>
                    <button form="subForm" type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        {initialData ? 'حفظ التغييرات' : 'إنشاء العقد وإضافة المقاول'}
                    </button>
                </div>
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
                <h3 className="font-bold text-lg text-slate-800 mb-1">تسديد دفعة مقاولة (دين)</h3>
                <p className="text-xs text-slate-500 mb-4">
                    تسديد جزء أو كل المبلغ للمرحلة: <span className="font-bold text-indigo-600">{expense.description}</span>
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

export const SubcontractorsTab: React.FC<SubcontractorsTabProps> = ({ contractId }) => {
    const { subcontractors, addSubcontractor, deleteSubcontractor, updateSubcontractor, getSubcontractorBalance, expenses, contracts, saveSubAgreement, getSubAgreement, payPartialDebt } = useContract();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Logic
    const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);

    const handleOpenAdd = () => {
        setEditingSub(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (sub: Subcontractor) => {
        setEditingSub(sub);
        setIsModalOpen(true);
    };

    const handleSaveSub = (data: any) => {
        addSubcontractor({
            name: data.name,
            phone: data.phone,
            specialty: data.specialty,
            companyName: data.companyName,
            address: data.address,
            defaultContractValue: data.defaultContractValue
        });
    };

    const displayedSubs = useMemo(() => {
        let list = subcontractors;
        if (contractId) {
            const usedIds = new Set(expenses.filter(e => e.contractId === contractId && e.subcontractorId).map(e => e.subcontractorId));
            list = list.filter(s => usedIds.has(s.id));
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s => 
                s.name.toLowerCase().includes(term) || 
                (s.companyName || '').toLowerCase().includes(term) ||
                s.specialty.toLowerCase().includes(term)
            );
        }
        return list;
    }, [subcontractors, expenses, contractId, searchTerm]);

    // Calculate Global Totals for Header
    const totals = useMemo(() => {
        let totalDue = 0;
        displayedSubs.forEach(s => {
            if(contractId) {
                 totalDue += expenses.filter(e => e.contractId === contractId && e.subcontractorId === s.id && e.paymentMethod === 'Credit')
                                     .reduce((acc, e) => acc + (e.amount - (e.paidAmount || 0)), 0);
            } else {
                totalDue += getSubcontractorBalance(s.id);
            }
        });
        return { count: displayedSubs.length, totalDue };
    }, [displayedSubs, contractId, expenses, getSubcontractorBalance]);

    // Calculate Project Totals
    const projectSummary = useMemo(() => {
        if (!contractId) return null;
        const subExpenses = expenses.filter(e => e.contractId === contractId && e.subcontractorId);
        const totalPaid = subExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
        
        let totalContractsValue = 0;
        displayedSubs.forEach(sub => {
            const agr = getSubAgreement(contractId, sub.id);
            if (agr) totalContractsValue += agr.totalAmount;
        });

        const remaining = totalContractsValue - totalPaid;
        return { totalContractsValue, totalPaid, remaining };
    }, [expenses, contractId, displayedSubs, getSubAgreement]);


    // --- Subcontractor Profile ---
    const SubcontractorProfile: React.FC<{ sub: Subcontractor; onEdit: () => void }> = ({ sub, onEdit }) => {
        const [isProjectsExpanded, setIsProjectsExpanded] = useState(false); // New state

        // ... agreement and expenses logic ...
        const agreement = contractId ? getSubAgreement(contractId, sub.id) : null;
        const [agreeAmount, setAgreeAmount] = useState(agreement?.totalAmount || sub.defaultContractValue || 0);
        const [agreeDuration, setAgreeDuration] = useState(agreement?.durationDays || 0);
        const [isAgreementEditing, setIsAgreementEditing] = useState(false);

        const subExpenses = expenses.filter(e => e.subcontractorId === sub.id && (!contractId || e.contractId === contractId));
        const totalPaid = subExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
        const totalBalance = getSubcontractorBalance(sub.id);

        const handleSaveAgreement = () => {
            if (!contractId) return;
            saveSubAgreement({
                id: agreement?.id || `sub-agr-${Date.now()}`,
                subcontractorId: sub.id,
                contractId: contractId,
                totalAmount: agreeAmount,
                durationDays: agreeDuration
            });
            setIsAgreementEditing(false);
        };

        // This logic finds ALL projects this subcontractor has worked on
        const linkedProjects = useMemo(() => {
            // Find projects from expenses OR from agreements
            const projectIdsFromExpenses = subExpenses.map(e => e.contractId);
            const uniqueProjectIds = Array.from(new Set(projectIdsFromExpenses));
            if (contractId && !uniqueProjectIds.includes(contractId)) uniqueProjectIds.push(contractId);

            const activeContractsList = contracts.filter(c => uniqueProjectIds.includes(c.id));

            return activeContractsList.map(proj => {
                const projExpenses = subExpenses.filter(e => e.contractId === proj.id);
                const projPaid = projExpenses.reduce((sum, e) => sum + (e.paymentMethod === 'Cash' ? e.amount : (e.paidAmount || 0)), 0);
                
                // Get Specific Agreement for this project
                const projAgreement = getSubAgreement(proj.id, sub.id);
                const projTotal = projAgreement ? projAgreement.totalAmount : (sub.defaultContractValue || 0);
                const projDuration = projAgreement ? projAgreement.durationDays : 0;
                
                const projRemaining = projTotal - projPaid;

                return { ...proj, projTotal, projPaid, projRemaining, projDuration };
            });
        }, [subExpenses, contracts, sub.id, sub.defaultContractValue, contractId, getSubAgreement]);

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
                    <button onClick={() => setSelectedSubId(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-bold transition-colors">
                        <div className="p-1 bg-white rounded-md border shadow-sm"><Icon name="chevron" size={16} className="rotate-90" /></div>
                        العودة للقائمة
                    </button>
                    <button onClick={onEdit} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        <Icon name="pencil" size={14} /> تعديل البيانات
                    </button>
                </div>

                {/* Compact Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Icon name="building" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800">{sub.name}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">{sub.specialty}</span>
                                {sub.companyName && <span className="text-xs text-slate-500">{sub.companyName}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t md:border-t-0 md:border-r border-slate-100 pt-3 md:pt-0 md:pr-4">
                        <span className="flex items-center gap-1.5"><Icon name="phone" size={14} className="text-slate-400"/> {sub.phone || 'غير مدخل'}</span>
                        <span className="flex items-center gap-1.5"><Icon name="home" size={14} className="text-slate-400"/> {sub.address || 'العنوان غير محدد'}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contractId ? (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-1">قيمة العقد الحالي</p>
                                <p className="text-lg font-black text-slate-800 font-mono">{formatCurrency(agreeAmount)}</p>
                            </div>
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Icon name="file-text" size={20} /></div>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-1">مجموع العقود الكلي</p>
                                <p className="text-lg font-black text-slate-800 font-mono">--</p>
                            </div>
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Icon name="layers" size={20} /></div>
                        </div>
                    )}
                    
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-600 font-bold mb-1">المجموع المدفوع</p>
                            <p className="text-lg font-black text-emerald-700 font-mono">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Icon name="check" size={20} /></div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-rose-600 font-bold mb-1">{contractId ? 'المتبقي من العقد' : 'الرصيد المستحق الكلي'}</p>
                            <p className="text-lg font-black text-rose-700 font-mono">
                                {contractId ? formatCurrency(agreeAmount - totalPaid) : formatCurrency(totalBalance)}
                            </p>
                        </div>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Icon name="alert" size={20} /></div>
                    </div>
                </div>

                {/* Specific Contract Section (Only visible when inside a Project Context) */}
                {contractId && (
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                                <Icon name="file-text" size={18} />
                                تفاصيل العقد لهذا المشروع
                            </h4>
                            {!isAgreementEditing && <button onClick={() => setIsAgreementEditing(true)} className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-blue-50">تعديل العقد</button>}
                        </div>
                        
                        {isAgreementEditing ? (
                            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">قيمة العقد</label>
                                        <input type="number" value={agreeAmount} onChange={e => setAgreeAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">المدة (يوم)</label>
                                        <input type="number" value={agreeDuration} onChange={e => setAgreeDuration(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm font-mono" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setIsAgreementEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg">إلغاء</button>
                                    <button onClick={handleSaveAgreement} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg">حفظ التغييرات</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-400 font-bold uppercase mb-1">القيمة المتفق عليها</p>
                                    <p className="font-black text-blue-900 text-xl font-mono">{formatCurrency(agreeAmount)} <span className="text-xs font-medium">IQD</span></p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-400 font-bold uppercase mb-1">المدة</p>
                                    <p className="font-black text-blue-900 text-xl font-mono">{agreeDuration} <span className="text-xs font-medium">يوم</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Linked Projects Summary - COLLAPSIBLE DROPDOWN */}
                {linkedProjects.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Icon name="briefcase" size={18} className="text-slate-500" />
                                <h3 className="font-bold text-slate-700 text-sm">العقود والمشاريع المرتبطة</h3>
                                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{linkedProjects.length}</span>
                            </div>
                            <Icon name="chevron" size={20} className={`text-slate-400 transition-transform duration-200 ${isProjectsExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isProjectsExpanded && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {linkedProjects.map(proj => (
                                        <div key={proj.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${proj.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span className="text-sm font-bold text-slate-800">{proj.projectDetails.projectName}</span>
                                                </div>
                                                {proj.id === contractId && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">المشروع الحالي</span>}
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <span className="block text-[10px] text-slate-500 mb-1">قيمة العقد</span>
                                                    <span className="block font-mono font-bold text-slate-800 text-xs">{formatCurrency(proj.projTotal)}</span>
                                                </div>
                                                <div className="bg-emerald-50 p-2 rounded-lg">
                                                    <span className="block text-[10px] text-emerald-600 mb-1">المدفوع</span>
                                                    <span className="block font-mono font-bold text-emerald-700 text-xs">{formatCurrency(proj.projPaid)}</span>
                                                </div>
                                                <div className="bg-rose-50 p-2 rounded-lg">
                                                    <span className="block text-[10px] text-rose-600 mb-1">المتبقي</span>
                                                    <span className="block font-mono font-bold text-rose-700 text-xs">{formatCurrency(proj.projRemaining)}</span>
                                                </div>
                                            </div>
                                            {proj.projDuration > 0 && (
                                                <div className="mt-2 text-[10px] text-slate-400 text-center">
                                                    مدة العقد: <span className="font-mono text-slate-600 font-bold">{proj.projDuration} يوم</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Icon name="file-text" size={16} />
                            سجل الدفعات
                        </h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-right">التاريخ</th>
                                    <th className="p-3 text-right">المشروع</th>
                                    <th className="p-3 text-right">البيان / المرحلة</th>
                                    <th className="p-3 text-right">المبلغ المدفوع</th>
                                    <th className="p-3 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subExpenses.sort((a, b) => {
                                    if (b.date !== a.date) {
                                        return b.date - a.date;
                                    }
                                    const aTime = Number(a.id.substring(4));
                                    const bTime = Number(b.id.substring(4));
                                    return bTime - aTime;
                                }).map(exp => {
                                    const paidAmount = exp.paidAmount || 0;
                                    const remaining = exp.paymentMethod === 'Credit' ? exp.amount - paidAmount : 0;
                                    
                                    return (
                                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 text-slate-500 font-mono">{new Date(exp.date).toLocaleDateString('en-GB')}</td>
                                        <td className="p-3 text-blue-700 font-bold">
                                            {contracts.find(c => c.id === exp.contractId)?.projectDetails.projectName || '-'}
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
                                {subExpenses.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">لا توجد دفعات مسجلة</td></tr>}
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

    const selectedSub = subcontractors.find(s => s.id === selectedSubId);

    return (
        <div className="space-y-6">
            {selectedSub ? (
                <SubcontractorProfile sub={selectedSub} onEdit={() => handleOpenEdit(selectedSub)} />
            ) : (
                <>
                    {!contractId ? (
                        <div className="space-y-6">
                            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-800 leading-tight">المقاولين الثانويين</h1>
                                    <p className="text-slate-500 mt-1">إدارة عقود الباطن (كهرباء، صحيات، تغليف...)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Icon name="search" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="بحث عن مقاول..." 
                                            className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-blue-400 w-64 shadow-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleOpenAdd}
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                                    >
                                        <Icon name="plus" size={18} />
                                        إضافة مقاول
                                    </button>
                                </div>
                            </header>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-blue-100 text-xs font-bold mb-1">إجمالي المقاولين</p>
                                        <h3 className="text-3xl font-black">{totals.count}</h3>
                                    </div>
                                    <Icon name="building" size={64} className="absolute -left-4 -bottom-4 text-blue-500 opacity-30" />
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold mb-1">مستحقات العقود</p>
                                        <h3 className="text-2xl font-black text-rose-600">{formatCurrency(totals.totalDue)}</h3>
                                    </div>
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Icon name="alert" size={24} /></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold mb-1">المقاولين النشطين</p>
                                        <h3 className="text-2xl font-black text-slate-800">{displayedSubs.length}</h3>
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
                                    <h1 className="text-2xl font-black text-slate-800">المقاولين الثانويين</h1>
                                    <p className="text-slate-500 text-sm">العقود الثانوية المرتبطة بهذا المشروع</p>
                                </div>
                                <button 
                                    onClick={handleOpenAdd}
                                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm flex items-center gap-2"
                                >
                                    <Icon name="plus" size={16} />
                                    إضافة مقاول جديد
                                </button>
                            </header>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mx-6 mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-right">المقاول</th>
                                    <th className="p-4 text-right">التخصص</th>
                                    <th className="p-4 text-right">الشركة</th>
                                    {contractId && <th className="p-4 text-right">قيمة العقد</th>}
                                    <th className="p-4 text-right">الرصيد المستحق</th>
                                    <th className="p-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedSubs.map(sub => {
                                    const agr = contractId ? getSubAgreement(contractId, sub.id) : null;
                                    const balance = getSubcontractorBalance(sub.id);

                                    return (
                                        <tr key={sub.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setSelectedSubId(sub.id)}>
                                            <td className="p-4 font-bold text-slate-700">{sub.name}</td>
                                            <td className="p-4 text-slate-500">{sub.specialty}</td>
                                            <td className="p-4 text-slate-500">{sub.companyName || '-'}</td>
                                            {contractId && <td className="p-4 font-mono font-bold text-blue-700">{agr ? formatCurrency(agr.totalAmount) : <span className="text-slate-400">-</span>}</td>}
                                            <td className="p-4">
                                                {balance > 0 ? (
                                                    <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">{formatCurrency(balance)}</span>
                                                ) : (
                                                    <span className="text-slate-400 font-mono font-bold">0</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-left">
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-slate-400 group-hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg" title="التفاصيل"><Icon name="file-text" size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(sub); }} className="text-slate-400 group-hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100" title="تعديل"><Icon name="pencil" size={16} /></button>
                                                    {!contractId && (
                                                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('حذف هذا المقاول؟')) deleteSubcontractor(sub.id) }} className="text-slate-400 group-hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100" title="حذف"><Icon name="trash" size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {displayedSubs.length === 0 && <tr><td colSpan={contractId ? 6 : 6} className="p-12 text-center text-slate-400">لا يوجد مقاولين ثانويين</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <SubcontractorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSub}
                onUpdate={updateSubcontractor}
                initialData={editingSub}
                contracts={contracts}
                fixedContractId={contractId}
            />
        </div>
    );
};
