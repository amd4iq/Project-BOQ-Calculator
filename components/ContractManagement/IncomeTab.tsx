
import React, { useState } from 'react';
import { Contract, ReceivedPayment } from '../../types';
import { useContract } from '../../contexts/ContractContext';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';

export const IncomeTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { addPayment, deletePayment, getContractPayments } = useContract();
    const payments = getContractPayments(contract.id);
    const [extraAmount, setExtraAmount] = useState('');
    const [extraNote, setExtraNote] = useState('');
    const [attachment, setAttachment] = useState<string | undefined>(undefined);
    const [showExtraForm, setShowExtraForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Calculate total received from schedule payments vs extra payments
    const scheduledPaymentsTotal = payments.filter(p => !p.isExtra).reduce((sum, p) => sum + p.amount, 0);
    const extraPaymentsTotal = payments.filter(p => p.isExtra).reduce((sum, p) => sum + p.amount, 0);

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

    const handleReceiveScheduled = (stageId: string, expectedAmount: number, stageName: string) => {
        // Check if already received
        if (payments.some(p => p.scheduleStageId === stageId)) return;
        
        const note = prompt(`تأكيد استلام دفعة: ${stageName}\nالمبلغ المتوقع: ${formatCurrency(expectedAmount)}\n\nهل تريد إضافة ملاحظة؟`);
        if (note === null) return; // Cancelled

        // In a real app, allow editing the amount. For simplicity, assume full amount.
        addPayment({
            contractId: contract.id,
            scheduleStageId: stageId,
            amount: expectedAmount,
            date: Date.now(),
            note: note || `دفعة مرحلة: ${stageName}`,
            isExtra: false,
            // NOTE: Scheduled payments via quick button won't have attachment for now to keep UI simple
            // Or trigger a modal. For now, no attachment.
        });
    };

    const handleAddExtra = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(extraAmount);
        if (!amt || amt <= 0) return;

        addPayment({
            contractId: contract.id,
            amount: amt,
            date: Date.now(),
            note: extraNote || 'دفعة إضافية',
            isExtra: true,
            attachmentUrl: attachment
        });
        setExtraAmount('');
        setExtraNote('');
        setAttachment(undefined);
        setShowExtraForm(false);
    };

    return (
        <div className="p-8 space-y-8">
             <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">سجل المقبوضات</h1>
                    <p className="text-slate-500">إدارة الدفعات المستلمة من العميل</p>
                </div>
                <div className="text-left">
                    <p className="text-xs text-slate-500 font-bold">المجموع الكلي المستلم</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(scheduledPaymentsTotal + extraPaymentsTotal)} <span className="text-sm">IQD</span></p>
                </div>
            </header>

            {/* Scheduled Payments */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon name="calendar" className="text-primary-600" />
                        دفعات العقد المجدولة
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {contract.paymentSchedule.map(stage => {
                        const expectedAmount = contract.totalContractValue * (stage.percentage / 100);
                        const receivedRecord = payments.find(p => p.scheduleStageId === stage.id);
                        const isPaid = !!receivedRecord;

                        return (
                            <div key={stage.id} className={`p-4 flex items-center justify-between transition-colors ${isPaid ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">{stage.name}</span>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{stage.percentage}%</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-mono mt-1">{formatCurrency(expectedAmount)} IQD</p>
                                    {isPaid && (
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                            <Icon name="check" size={12} />
                                            تم الاستلام بتاريخ {new Date(receivedRecord.date).toLocaleDateString('ar-IQ')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {isPaid ? (
                                        <button 
                                            onClick={() => { if(window.confirm('إلغاء استلام هذه الدفعة؟')) deletePayment(receivedRecord.id); }}
                                            className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-50"
                                        >
                                            مدفوع (إلغاء)
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleReceiveScheduled(stage.id, expectedAmount, stage.name)}
                                            className="px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-xs hover:bg-primary-700 shadow-sm"
                                        >
                                            تسجيل استلام
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Extra Payments */}
            <section>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon name="plus" className="text-amber-500" />
                        دفعات إضافية (خارج الجدول)
                    </h3>
                    <button 
                        onClick={() => setShowExtraForm(!showExtraForm)}
                        className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                        {showExtraForm ? 'إلغاء' : 'إضافة دفعة جديدة'}
                    </button>
                </div>

                {showExtraForm && (
                    <form onSubmit={handleAddExtra} className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6 flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-amber-800 mb-1 block">قيمة الدفعة</label>
                            <input 
                                type="number" 
                                value={extraAmount} 
                                onChange={e => setExtraAmount(e.target.value)} 
                                className="w-full p-2 rounded-lg border border-amber-200 focus:outline-none focus:border-amber-400"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="flex-[2] w-full">
                             <label className="text-xs font-bold text-amber-800 mb-1 block">ملاحظات / سبب الدفعة</label>
                            <input 
                                type="text" 
                                value={extraNote} 
                                onChange={e => setExtraNote(e.target.value)} 
                                className="w-full p-2 rounded-lg border border-amber-200 focus:outline-none focus:border-amber-400"
                                placeholder="مثال: أعمال إضافية في الحديقة"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-amber-800 mb-1 block">صورة الوصل</label>
                            <label className="cursor-pointer flex items-center justify-center gap-2 bg-white border border-amber-200 hover:border-amber-400 text-amber-700 p-2 rounded-lg transition-colors h-[42px] px-4">
                                <Icon name={attachment ? "check" : "image-plus"} size={18} />
                                <span className="text-xs font-bold">{attachment ? "تم ارفاق صورة" : "ارفاق صورة"}</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <button type="submit" className="w-full md:w-auto bg-amber-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 h-[42px]">
                            حفظ
                        </button>
                    </form>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {payments.filter(p => p.isExtra).length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">لا توجد دفعات إضافية مسجلة</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="p-3 text-right">المبلغ</th>
                                    <th className="p-3 text-right">التاريخ</th>
                                    <th className="p-3 text-right">الملاحظات</th>
                                    <th className="p-3 text-center">مرفق</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.filter(p => p.isExtra).map(pay => (
                                    <tr key={pay.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono font-bold text-emerald-600">{formatCurrency(pay.amount)}</td>
                                        <td className="p-3 text-slate-600">{new Date(pay.date).toLocaleDateString('ar-IQ')}</td>
                                        <td className="p-3 text-slate-600">{pay.note}</td>
                                        <td className="p-3 text-center">
                                            {pay.attachmentUrl ? (
                                                <button onClick={() => setPreviewImage(pay.attachmentUrl || null)} className="text-indigo-500 hover:text-indigo-700 flex justify-center w-full">
                                                    <Icon name="image-plus" size={18} />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-left">
                                            <button onClick={() => deletePayment(pay.id)} className="text-rose-400 hover:text-rose-600">
                                                <Icon name="trash" size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black hover:bg-slate-200">
                            <Icon name="x" size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
