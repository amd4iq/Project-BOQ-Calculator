import React, { useState } from 'react';
import { Contract, PaymentStage, ReceivedPayment } from '../../../core/types.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';

// A new type for the modal state
type PaymentModalData = {
    stageId: string;
    stageName: string;
    expectedAmount: number;
    remainingAmount: number;
};

// New Component: PaymentHistoryModal
const PaymentHistoryModal: React.FC<{
    stage: PaymentStage;
    contract: Contract;
    onClose: () => void;
    setPreviewImage: (url: string | null) => void;
}> = ({ stage, contract, onClose, setPreviewImage }) => {
    const { getContractPayments, addPayment, deletePayment } = useContract();
    
    const stagePayments = getContractPayments(contract.id).filter(p => p.scheduleStageId === stage.id).sort((a, b) => b.date - a.date);

    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{ amount: string; date: string; note: string }>({ amount: '', date: '', note: '' });

    const handleStartEdit = (payment: ReceivedPayment) => {
        setEditingPaymentId(payment.id);
        setEditData({
            amount: payment.amount.toString(),
            date: new Date(payment.date).toISOString().split('T')[0],
            note: payment.note || '',
        });
    };

    const handleSaveEdit = () => {
        if (!editingPaymentId) return;

        const originalPayment = stagePayments.find(p => p.id === editingPaymentId);
        if (!originalPayment) return;

        const amount = parseFloat(editData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('الرجاء إدخال مبلغ صحيح.');
            return;
        }

        deletePayment(editingPaymentId);
        addPayment({
            contractId: contract.id,
            scheduleStageId: stage.id,
            amount: amount,
            date: new Date(editData.date).getTime(),
            note: editData.note,
            isExtra: originalPayment.isExtra,
            attachmentUrl: originalPayment.attachmentUrl,
            recordedBy: originalPayment.recordedBy,
        });

        setEditingPaymentId(null);
    };

    const handleDelete = (paymentId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدفعة الجزئية؟')) {
            deletePayment(paymentId);
        }
    };
    
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">سجل الدفعات لـ: <span className="text-primary-600">{stage.name}</span></h3>
                        <p className="text-xs text-slate-500 mt-1">عرض وتعديل الدفعات الجزئية المسجلة لهذه المرحلة.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><Icon name="x" size={20}/></button>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto bg-slate-50/50">
                    {stagePayments.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">لا توجد دفعات مسجلة.</p>
                    ) : stagePayments.map(p => (
                        editingPaymentId === p.id ? (
                            <div key={p.id} className="bg-primary-50 p-4 rounded-xl border-2 border-dashed border-primary-200 space-y-3 animate-in fade-in duration-200">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm font-bold bg-white"/>
                                    <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm bg-white"/>
                                </div>
                                <input type="text" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} placeholder="ملاحظة" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"/>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setEditingPaymentId(null)} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-md">إلغاء</button>
                                    <button onClick={handleSaveEdit} className="px-3 py-1 text-xs font-bold bg-primary-600 text-white rounded-md hover:bg-primary-700">حفظ التعديل</button>
                                </div>
                            </div>
                        ) : (
                             <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">{formatCurrency(p.amount)} <span className="text-xs text-slate-400 font-normal">IQD</span></p>
                                        {p.note && <p className="text-sm text-slate-600 mt-1">{p.note}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleStartEdit(p)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="تعديل"><Icon name="pencil" size={14}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="حذف"><Icon name="trash" size={14}/></button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Icon name="user" size={14}/>
                                        <span className="font-semibold">{p.recordedBy || 'غير مسجل'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {p.attachmentUrl && (
                                            <button onClick={() => setPreviewImage(p.attachmentUrl)} className="flex items-center gap-1.5 font-semibold hover:text-primary-600">
                                                <Icon name="image-plus" size={14}/> عرض الوصل
                                            </button>
                                        )}
                                        <span className="font-mono">{new Date(p.date).toLocaleDateString('ar-IQ')}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm">إغلاق</button>
                </div>
            </div>
        </div>
    );
};


export const IncomeTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { addPayment, deletePayment, getContractPayments, updateContractDetails } = useContract();
    const { currentUser } = useAuth();
    const payments = getContractPayments(contract.id);
    
    // States for the Extra Payment form
    const [extraAmount, setExtraAmount] = useState('');
    const [extraNote, setExtraNote] = useState('');
    const [extraAttachment, setExtraAttachment] = useState<string | undefined>(undefined);
    const [showExtraForm, setShowExtraForm] = useState(false);
    
    // States for the Scheduled Payment Modal
    const [paymentModalData, setPaymentModalData] = useState<PaymentModalData | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentAttachment, setPaymentAttachment] = useState<string | undefined>(undefined);
    const [viewingHistoryForStage, setViewingHistoryForStage] = useState<PaymentStage | null>(null);


    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const scheduledPaymentsTotal = payments.filter(p => !p.isExtra).reduce((sum, p) => sum + p.amount, 0);
    const extraPaymentsTotal = payments.filter(p => p.isExtra).reduce((sum, p) => sum + p.amount, 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | undefined>>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleOpenPaymentModal = (stageId: string, expectedAmount: number, stageName: string) => {
        const stagePayments = payments.filter(p => p.scheduleStageId === stageId);
        const totalPaidForStage = stagePayments.reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = expectedAmount - totalPaidForStage;

        setPaymentAmount(remainingAmount > 0 ? remainingAmount.toString() : "");
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentNote('');
        setPaymentAttachment(undefined);
        setPaymentModalData({ stageId, stageName, expectedAmount, remainingAmount });
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentModalData || !currentUser) return;
        
        const receivedAmount = parseFloat(paymentAmount);
        if (isNaN(receivedAmount) || receivedAmount <= 0) {
            alert("الرجاء إدخال مبلغ صحيح.");
            return;
        }
        
        if (receivedAmount > paymentModalData.remainingAmount) {
            if (!window.confirm(`المبلغ المدخل (${formatCurrency(receivedAmount)}) أكبر من المتبقي (${formatCurrency(paymentModalData.remainingAmount)}). هل تريد المتابعة؟`)) {
                return;
            }
        }

        addPayment({
            contractId: contract.id,
            scheduleStageId: paymentModalData.stageId,
            amount: receivedAmount,
            date: new Date(paymentDate).getTime(),
            note: paymentNote || `دفعة مرحلة: ${paymentModalData.stageName}`,
            isExtra: false,
            attachmentUrl: paymentAttachment,
            recordedBy: currentUser.displayName || currentUser.name,
        });
        setPaymentModalData(null);
    };

    const handleStageChange = (stageId: string, field: 'name' | 'percentage', value: string | number) => {
        const newSchedule = contract.paymentSchedule.map(stage => {
            if (stage.id === stageId) {
                const newValue = field === 'percentage' ? Math.max(0, Math.min(100, Number(value))) : value;
                return { ...stage, [field]: newValue };
            }
            return stage;
        });
        updateContractDetails(contract.id, { paymentSchedule: newSchedule });
    };

    const handleAddStage = () => {
        const newStage: PaymentStage = {
          id: `stage-${Date.now()}`,
          name: 'مرحلة جديدة',
          percentage: 0
        };
        const newSchedule = [...contract.paymentSchedule, newStage];
        updateContractDetails(contract.id, { paymentSchedule: newSchedule });
    };

    const handleDeleteStage = (stageId: string) => {
        if (contract.paymentSchedule.length <= 1) {
            alert('يجب وجود مرحلة واحدة على الأقل في جدول الدفعات.');
            return;
        }
        if (window.confirm('هل أنت متأكد من حذف هذه المرحلة؟')) {
            const newSchedule = contract.paymentSchedule.filter(s => s.id !== stageId);
            updateContractDetails(contract.id, { paymentSchedule: newSchedule });
        }
    };

    const handleAddExtra = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        const amt = parseFloat(extraAmount);
        if (!amt || amt <= 0) return;
        addPayment({
            contractId: contract.id,
            amount: amt,
            date: Date.now(),
            note: extraNote || 'دفعة إضافية',
            isExtra: true,
            attachmentUrl: extraAttachment,
            recordedBy: currentUser.displayName || currentUser.name,
        });
        setExtraAmount('');
        setExtraNote('');
        setExtraAttachment(undefined);
        setShowExtraForm(false);
    };

    const totalPercentage = contract.paymentSchedule.reduce((sum, item) => sum + item.percentage, 0);
    const isTotalValid = Math.abs(totalPercentage - 100) < 0.1;
    
    return (
        <div className="p-8 space-y-8">
             <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">سجل المقبوضات</h1>
                    <p className="text-slate-500">إدارة الدفعات المستلمة من العميل</p>
                </div>
                <div className="text-left">
                    <p className="text-xs text-slate-500 font-bold">المجموع الكلي المستلم</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(scheduledPaymentsTotal + extraPaymentsTotal)} IQD</p>
                     <p className="text-[10px] text-slate-400 mt-1">
                        المجدول: {formatCurrency(scheduledPaymentsTotal)} + الإضافي: {formatCurrency(extraPaymentsTotal)}
                    </p>
                </div>
            </header>

            <section>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg mb-4"><Icon name="calendar" className="text-primary-600" />دفعات العقد المجدولة</h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/70 border-b border-slate-200">
                            <tr>
                                <th className="p-3 font-extrabold text-slate-600 text-center w-[5%]">#</th>
                                <th className="p-3 font-extrabold text-slate-600 text-right w-[25%]">المرحلة</th>
                                <th className="p-3 font-extrabold text-slate-600 text-center w-[10%]">النسبة</th>
                                <th className="p-3 font-extrabold text-slate-600 text-right w-[15%]">المبلغ المتوقع</th>
                                <th className="p-3 font-extrabold text-slate-600 text-right w-[15%]">المستلم / المتبقي</th>
                                <th className="p-3 font-extrabold text-slate-600 text-center w-[15%]">الحالة</th>
                                <th className="p-3 font-extrabold text-slate-600 text-center w-[15%]">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contract.paymentSchedule.map((stage, index) => {
                                const expectedAmount = contract.totalContractValue * (stage.percentage / 100);
                                const stagePayments = payments.filter(p => p.scheduleStageId === stage.id);
                                const totalPaid = stagePayments.reduce((sum, p) => sum + p.amount, 0);
                                const remaining = Math.max(0, expectedAmount - totalPaid);
                                const isFullyPaid = remaining <= 0 && expectedAmount > 0;
                                const progress = expectedAmount > 0 ? (totalPaid / expectedAmount) * 100 : 0;

                                return (
                                    <tr key={stage.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-3 text-center text-slate-400 font-mono font-bold">{index + 1}</td>
                                        <td className="p-2"><input type="text" value={stage.name} onChange={e => handleStageChange(stage.id, 'name', e.target.value)} className="w-full bg-transparent px-2 py-1 rounded-md border border-transparent hover:border-slate-200 focus:border-primary-300 outline-none font-bold text-slate-800" /></td>
                                        <td className="p-2"><div className="relative w-20 mx-auto"><input type="number" value={stage.percentage} onChange={e => handleStageChange(stage.id, 'percentage', e.target.value)} className="w-full bg-transparent px-2 py-1 rounded-md border border-transparent hover:border-slate-200 focus:border-primary-300 outline-none text-center font-mono" /><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span></div></td>
                                        <td className="p-3 font-mono text-slate-500">{formatCurrency(expectedAmount)}</td>
                                        <td className="p-3 font-mono"><div className="font-bold text-emerald-600">{formatCurrency(totalPaid)}</div><div className="text-xs text-rose-600">{formatCurrency(remaining)}</div></td>
                                        <td className="p-3"><div className="w-full bg-slate-200 rounded-full h-2"><div className={`h-full rounded-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{width: `${Math.min(progress, 100)}%`}}></div></div></td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isFullyPaid && (
                                                    <button onClick={() => handleOpenPaymentModal(stage.id, expectedAmount, stage.name)} className="p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600 rounded-lg" title="تسجيل دفعة">
                                                        <Icon name="wallet" size={16} />
                                                    </button>
                                                )}
                                                {totalPaid > 0 && (
                                                    <button onClick={() => setViewingHistoryForStage(stage)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg" title="سجل الدفعات">
                                                        <Icon name="file-text" size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteStage(stage.id)} className="p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg" title="حذف المرحلة">
                                                    <Icon name="trash" size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                             <tr>
                                <td className="p-3 font-extrabold text-slate-800" colSpan={2}>المجموع</td>
                                <td className={`p-3 text-center font-black text-lg font-mono ${!isTotalValid ? 'text-red-600' : 'text-emerald-600'}`}>{totalPercentage.toFixed(0)}%</td>
                                <td className="p-3 font-black text-lg font-mono text-slate-800">{formatCurrency(contract.totalContractValue)}</td>
                                <td colSpan={3}>
                                    {!isTotalValid && <div className="text-xs font-bold text-red-600 text-center bg-red-50 p-1 rounded-md">المجموع يجب أن يكون 100%</div>}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="mt-4">
                    <button onClick={handleAddStage} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                        <Icon name="plus" size={14} /> إضافة مرحلة جديدة
                    </button>
                </div>
            </section>
            
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Icon name="dollar-sign" className="text-primary-600" />دفعات إضافية</h3>
                    <button onClick={() => setShowExtraForm(!showExtraForm)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-100">
                        {showExtraForm ? 'إلغاء' : 'إضافة دفعة'}
                    </button>
                </div>
                {showExtraForm && (
                    <form onSubmit={handleAddExtra} className="p-4 bg-slate-50/70 border-b border-slate-200 space-y-3 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={extraAmount} onChange={e => setExtraAmount(e.target.value)} placeholder="المبلغ" className="p-2 border border-slate-200 rounded-lg text-sm" required />
                            <input type="text" value={extraNote} onChange={e => setExtraNote(e.target.value)} placeholder="ملاحظة" className="p-2 border border-slate-200 rounded-lg text-sm" required />
                        </div>
                        <div>
                            <label className="cursor-pointer flex items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 p-2 rounded-lg group">
                                <Icon name={extraAttachment ? "check" : "image-plus"} size={16} className={`${extraAttachment ? "text-indigo-500" : "group-hover:text-indigo-500"}`} />
                                <span className={`text-xs font-bold ${extraAttachment ? "text-indigo-600" : "group-hover:text-indigo-600"}`}>{extraAttachment ? "تم إرفاق صورة" : "ارفع صورة الوصل"}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setExtraAttachment)} className="hidden" />
                            </label>
                        </div>
                        <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700">حفظ الدفعة الإضافية</button>
                    </form>
                )}
                <div className="divide-y divide-slate-100">
                    {payments.filter(p => p.isExtra).length === 0 && !showExtraForm ? (
                        <p className="p-6 text-center text-sm text-slate-400">لا توجد دفعات إضافية مسجلة.</p>
                    ) : (
                        payments.filter(p => p.isExtra).map(p => (
                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <p className="font-bold text-slate-800">{p.note}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                                        <span>{new Date(p.date).toLocaleString('ar-IQ')}</span>
                                        {p.recordedBy && <span className="flex items-center gap-1 font-sans font-semibold text-slate-500"><Icon name="user" size={12}/>{p.recordedBy}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-sm font-mono text-emerald-600">{formatCurrency(p.amount)}</span>
                                    {p.attachmentUrl && <button onClick={() => setPreviewImage(p.attachmentUrl!)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-md"><Icon name="image-plus" size={16} /></button>}
                                    <button onClick={() => { if(window.confirm('حذف هذه الدفعة؟')) deletePayment(p.id); }} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md"><Icon name="trash" size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Scheduled Payment Modal */}
            {paymentModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmitPayment}>
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">تسجيل دفعة لـ: <span className="text-primary-600">{paymentModalData.stageName}</span></h3>
                                <p className="text-xs text-slate-500 mt-1">المبلغ المتبقي لهذه المرحلة: <span className="font-mono font-bold text-amber-600">{formatCurrency(paymentModalData.remainingAmount)}</span></p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 mb-1 block">المبلغ المستلم</label>
                                        <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold" required autoFocus />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 mb-1 block">تاريخ الاستلام</label>
                                        <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600 mb-1 block">ملاحظة (اختياري)</label>
                                    <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="تفاصيل الدفعة..." className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary-400 text-slate-500 p-3 rounded-lg group">
                                        <Icon name={paymentAttachment ? "check" : "image-plus"} size={16} className={`${paymentAttachment ? "text-primary-500" : "group-hover:text-primary-500"}`} />
                                        <span className={`text-xs font-bold ${paymentAttachment ? "text-primary-600" : "group-hover:text-primary-600"}`}>{paymentAttachment ? "تم إرفاق صورة" : "ارفع صورة الوصل (اختياري)"}</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPaymentAttachment)} className="hidden" />
                                    </label>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setPaymentModalData(null)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm">إلغاء</button>
                                <button type="submit" className="px-5 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 text-sm">تأكيد الاستلام</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {viewingHistoryForStage && (
                <PaymentHistoryModal
                    stage={viewingHistoryForStage}
                    contract={contract}
                    onClose={() => setViewingHistoryForStage(null)}
                    setPreviewImage={setPreviewImage}
                />
            )}

            {previewImage && (<div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" /></div>)}
        </div>
    );
};