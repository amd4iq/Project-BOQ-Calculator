
import React, { useState, useEffect } from 'react';
import { Expense } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';

interface PaymentModalProps {
    expense: Expense | null;
    remainingAmount: number;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, date: string, attachmentUrl?: string, receiptNumber?: string, receiptDate?: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ expense, remainingAmount, isOpen, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attachment, setAttachment] = useState<string | undefined>(undefined);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [receiptDate, setReceiptDate] = useState('');

    useEffect(() => {
        if (isOpen && expense) {
            setAmount(remainingAmount > 0 ? remainingAmount : '');
            setDate(new Date().toISOString().split('T')[0]);
            // Pre-fill with previous data
            setAttachment(expense.attachmentUrl);
            setReceiptNumber(expense.receiptNumber || '');
            setReceiptDate(expense.receiptDate ? new Date(expense.receiptDate).toISOString().split('T')[0] : '');
        }
    }, [isOpen, expense, remainingAmount]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleConfirm = () => {
        const numAmount = Number(amount);
        if (numAmount > 0 && numAmount <= remainingAmount) {
            onConfirm(numAmount, date, attachment, receiptNumber, receiptDate ? new Date(receiptDate).getTime() : undefined);
        }
    }

    if (!isOpen || !expense) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full"><Icon name="check-simple" size={24} /></div>
                    <div>
                        <h3 className="font-black text-xl text-slate-800">تسديد دفعة</h3>
                        <p className="text-xs text-slate-500 font-medium">سداد دين سابق</p>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                    <p className="font-bold text-slate-900 text-sm mb-3">{expense.description}</p>
                    <div className="text-center border-t border-slate-200/50 pt-2">
                        <span className="text-[9px] text-amber-600 block mb-0.5">المبلغ المتبقي</span>
                        <span className="font-mono font-bold text-lg text-amber-700">{formatCurrency(remainingAmount)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 text-sm font-mono bg-slate-50 focus:bg-white"/>
                    <div className="relative">
                        <input type="number" value={amount} max={remainingAmount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 font-bold text-lg text-slate-800 font-mono pl-16" autoFocus/>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">IQD</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="رقم الوصل" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 text-xs font-bold bg-slate-50 focus:bg-white" />
                        <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 text-xs font-mono bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 text-slate-500 p-3 rounded-xl group">
                            <Icon name={attachment ? "check" : "image-plus"} size={18} className={`${attachment ? "text-emerald-500" : "group-hover:text-emerald-500"}`} />
                            <span className={`text-xs font-bold ${attachment ? "text-emerald-600" : "group-hover:text-emerald-600"}`}>{attachment ? "تم ارفاق صورة" : "ارفع صورة الوصل"}</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        {attachment && (
                            <button onClick={() => setAttachment(undefined)} className="w-full text-center text-xs text-rose-600 hover:underline mt-1.5">
                                إزالة الصورة
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-50">إلغاء</button>
                    <button onClick={handleConfirm} disabled={Number(amount) <= 0 || Number(amount) > remainingAmount} className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-slate-300 shadow-lg shadow-emerald-200">تأكيد العملية</button>
                </div>
            </div>
        </div>
    );
};
