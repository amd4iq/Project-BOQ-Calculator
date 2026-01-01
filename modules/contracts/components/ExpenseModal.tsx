
import React, { useState, useEffect } from 'react';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { Expense } from '../../../core/types.ts';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId?: string;
    expense?: Expense | null;
    beneficiary?: { type: 'Supplier' | 'Worker' | 'Subcontractor'; id: string; name: string };
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, contractId, expense, beneficiary }) => {
    const { addExpense, updateExpense, suppliers, workers, subcontractors, contracts } = useContract();
    
    // Form State
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'Material' | 'Labor' | 'Transport' | 'Other' | 'DebtPayment'>('Material');
    const [beneficiaryType, setBeneficiaryType] = useState<'Supplier' | 'Worker' | 'Subcontractor' | 'Other'>('Supplier');
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
    const [paidAmount, setPaidAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attachment, setAttachment] = useState<string | undefined>(undefined);
    const [receiptNumber, setReceiptNumber] = useState<string>('');
    const [receiptDate, setReceiptDate] = useState<string>('');
    const [error, setError] = useState('');
    const [localContractId, setLocalContractId] = useState(contractId || '');

    const isEditing = !!expense;

    const beneficiaryLists = {
        Supplier: suppliers,
        Worker: workers,
        Subcontractor: subcontractors
    };

    useEffect(() => {
        if (isOpen) {
            if (isEditing && expense) {
                setDescription(expense.description);
                setCategory(expense.category);
                setBeneficiaryType(expense.beneficiaryType || 'Other');
                setBeneficiaryId(expense.supplierId || expense.workerId || expense.subcontractorId || '');
                setAmount(expense.amount);
                setPaymentMethod(expense.paymentMethod);
                setPaidAmount(expense.paidAmount || '');
                setDate(new Date(expense.date).toISOString().split('T')[0]);
                setAttachment(expense.attachmentUrl);
                setReceiptNumber(expense.receiptNumber || '');
                setReceiptDate(expense.receiptDate ? new Date(expense.receiptDate).toISOString().split('T')[0] : '');
                setLocalContractId(expense.contractId);
            } else {
                // Reset form for new entry
                setDescription('');
                setCategory('Material');
                const benType = beneficiary ? beneficiary.type : 'Supplier';
                setBeneficiaryType(benType);
                
                let defaultBenId = '';
                if (beneficiary) {
                    defaultBenId = beneficiary.id;
                } else if (benType === 'Supplier') {
                    defaultBenId = suppliers[0]?.id || '';
                } else if (benType === 'Worker') {
                    defaultBenId = workers[0]?.id || '';
                } else if (benType === 'Subcontractor') {
                    defaultBenId = subcontractors[0]?.id || '';
                }
                setBeneficiaryId(defaultBenId);

                setAmount('');
                setPaymentMethod('Cash');
                setPaidAmount('');
                setDate(new Date().toISOString().split('T')[0]);
                setAttachment(undefined);
                setReceiptNumber('');
                setReceiptDate('');
                setLocalContractId(contractId || contracts[0]?.id || '');
            }
            setError('');
        }
    }, [isOpen, expense, isEditing, suppliers, workers, subcontractors, contractId, beneficiary, contracts]);

    useEffect(() => {
        if (paymentMethod === 'Cash') {
            setPaidAmount(amount);
        }
    }, [amount, paymentMethod]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        const numAmount = Number(amount);
        if (!description.trim() || !numAmount || numAmount <= 0) {
            setError('الوصف والمبلغ حقول مطلوبة.'); return;
        }
        if (!localContractId) {
            setError('يرجى تحديد المشروع.'); return;
        }
        if (beneficiaryType !== 'Other' && !beneficiaryId) {
            setError('يرجى تحديد المستفيد.'); return;
        }

        const expenseData: Omit<Expense, 'id'> = {
            contractId: localContractId,
            date: new Date(date).getTime(),
            description,
            amount: numAmount,
            category,
            paymentMethod,
            beneficiaryType: beneficiaryType === 'Other' ? undefined : beneficiaryType,
            supplierId: beneficiaryType === 'Supplier' ? beneficiaryId : undefined,
            workerId: beneficiaryType === 'Worker' ? beneficiaryId : undefined,
            subcontractorId: beneficiaryType === 'Subcontractor' ? beneficiaryId : undefined,
            paidAmount: paymentMethod === 'Cash' ? numAmount : Number(paidAmount) || 0,
            attachmentUrl: attachment,
            notes: '',
            receiptNumber: receiptNumber || undefined,
            receiptDate: receiptDate ? new Date(receiptDate).getTime() : undefined,
        };

        if (isEditing && expense) {
            updateExpense(expense.id, expenseData);
        } else {
            addExpense(expenseData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                            <Icon name="trending-down" size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{isEditing ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</h2>
                            <p className="text-sm text-slate-500">تسجيل عملية صرف جديدة للمشروع</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={24} /></button>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto">
                    {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-bold">{error}</div>}
                    
                    {!contractId && (
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">المشروع</label>
                            <select value={localContractId} onChange={e => setLocalContractId(e.target.value)} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" disabled={isEditing}>
                                <option value="" disabled>-- اختر المشروع --</option>
                                {contracts.map(c => <option key={c.id} value={c.id}>{c.projectDetails.projectName}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">وصف المصروف</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="مثال: شراء اسمنت..." className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">المبلغ الإجمالي</label>
                            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="0" className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 font-bold" />
                        </div>
                         <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">تاريخ العملية</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">نوع المصروف</label>
                            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200">
                                <option value="Material">مواد</option><option value="Labor">أجور</option><option value="Transport">نقل</option><option value="Other">أخرى</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">المستفيد</label>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={beneficiaryType} onChange={e => { setBeneficiaryType(e.target.value as any); setBeneficiaryId(''); }} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" disabled={!!beneficiary}>
                                    <option value="Supplier">مورد</option><option value="Worker">عامل</option><option value="Subcontractor">مقاول ثانوي</option><option value="Other">آخر</option>
                                </select>
                                {beneficiaryType !== 'Other' ? (
                                    <select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" disabled={!!beneficiary}>
                                        <option value="" disabled>-- اختر --</option>
                                        {(beneficiaryLists[beneficiaryType] || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                ) : (
                                    <input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} placeholder="اكتب اسم المستفيد" className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">طريقة الدفع</label>
                            <div className="flex gap-2">
                               <button onClick={() => setPaymentMethod('Cash')} className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-bold text-sm ${paymentMethod === 'Cash' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>نقدي</button>
                               <button onClick={() => setPaymentMethod('Credit')} className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-bold text-sm ${paymentMethod === 'Credit' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600'}`}>دين (آجل)</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">المبلغ المدفوع مبدئياً (اختياري)</label>
                            <input 
                                type="number" 
                                value={paidAmount} 
                                onChange={e => setPaidAmount(Number(e.target.value))} 
                                placeholder="0" 
                                className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed" 
                                disabled={paymentMethod === 'Cash'}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">تفاصيل الوصل (اختياري)</label>
                        <div className="grid grid-cols-3 gap-4">
                             <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">رقم الوصل</label>
                                <input type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="رقم الوصل" className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">تاريخه</label>
                                <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="w-full p-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200" />
                            </div>
                             <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">صورة الوصل</label>
                                <label className="cursor-pointer h-[46px] flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 p-2.5 rounded-xl group">
                                    <Icon name={attachment ? "check" : "image-plus"} size={18} className={`${attachment ? "text-indigo-500" : "group-hover:text-indigo-500"}`} />
                                    <span className={`text-sm font-bold ${attachment ? "text-indigo-600" : "group-hover:text-indigo-600"}`}>{attachment ? "تم الإرفاق" : "ارفع صورة"}</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">إلغاء</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">حفظ المصروف</button>
                </div>
            </div>
        </div>
    );
};
