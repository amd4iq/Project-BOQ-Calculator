
import React, { useState } from 'react';
import { Contract } from '../../../core/types.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';

export const IncomeTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { addPayment, deletePayment, getContractPayments } = useContract();
    const payments = getContractPayments(contract.id);
    const [extraAmount, setExtraAmount] = useState('');
    const [extraNote, setExtraNote] = useState('');
    const [attachment, setAttachment] = useState<string | undefined>(undefined);
    const [showExtraForm, setShowExtraForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const scheduledPaymentsTotal = payments.filter(p => !p.isExtra).reduce((sum, p) => sum + p.amount, 0);
    const extraPaymentsTotal = payments.filter(p => p.isExtra).reduce((sum, p) => sum + p.amount, 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleReceiveScheduled = (stageId: string, expectedAmount: number, stageName: string) => {
        if (payments.some(p => p.scheduleStageId === stageId)) return;
        const note = prompt(`تأكيد استلام دفعة: ${stageName}\nالمبلغ المتوقع: ${formatCurrency(expectedAmount)}\n\nهل تريد إضافة ملاحظة؟`);
        if (note === null) return;

        addPayment({
            contractId: contract.id,
            scheduleStageId: stageId,
            amount: expectedAmount,
            date: Date.now(),
            note: note || `دفعة مرحلة: ${stageName}`,
            isExtra: false,
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
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(scheduledPaymentsTotal + extraPaymentsTotal)} IQD</p>
                </div>
            </header>

            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Icon name="calendar" className="text-primary-600" />دفعات العقد المجدولة</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {contract.paymentSchedule.map(stage => {
                        const expectedAmount = contract.totalContractValue * (stage.percentage / 100);
                        const receivedRecord = payments.find(p => p.scheduleStageId === stage.id);
                        const isPaid = !!receivedRecord;
                        return (
                            <div key={stage.id} className={`p-4 flex items-center justify-between ${isPaid ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                <div>
                                    <div className="flex items-center gap-2"><span className="font-bold text-slate-800">{stage.name}</span><span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{stage.percentage}%</span></div>
                                    <p className="text-sm text-slate-500 font-mono mt-1">{formatCurrency(expectedAmount)} IQD</p>
                                </div>
                                <div>
                                    {isPaid ? (
                                        <button onClick={() => { if(window.confirm('إلغاء استلام هذه الدفعة؟')) deletePayment(receivedRecord.id); }} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs">مدفوع (إلغاء)</button>
                                    ) : (
                                        <button onClick={() => handleReceiveScheduled(stage.id, expectedAmount, stage.name)} className="px-4 py-2 bg-primary-600 text-white font-bold rounded-xl text-xs">تسجيل استلام</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            {previewImage && (<div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><img src={previewImage} alt="Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" /></div>)}
        </div>
    );
};
