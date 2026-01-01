
import React, { useState } from 'react';
import { Expense, PaymentHistoryEntry } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';

interface PaymentHistoryModalProps {
    expense: Expense | null;
    isOpen: boolean;
    onClose: () => void;
    onPreviewImage: (data: { url: string; receiptNumber?: string; receiptDate?: number; }) => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ expense, isOpen, onClose, onPreviewImage }) => {

    if (!isOpen || !expense) return null;

    const allEntries: PaymentHistoryEntry[] = [...(expense.paymentHistory || [])];
    
    const recordedPaidAmount = expense.paymentHistory?.reduce((sum, h) => sum + h.amount, 0) || 0;
    const initialPaymentAmount = (expense.paidAmount || 0) - recordedPaidAmount;

    if (initialPaymentAmount > 0) {
        allEntries.unshift({
            id: 'initial-payment',
            date: expense.date,
            amount: initialPaymentAmount,
            attachmentUrl: expense.attachmentUrl,
            receiptNumber: expense.receiptNumber,
            receiptDate: expense.receiptDate,
            note: 'دفعة أولية عند التسجيل'
        });
    }

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

                    {allEntries.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-sm font-bold">لا توجد دفعات مسجلة لهذا المصروف.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الدفعات المسجلة</h4>
                            {allEntries.slice().reverse().map(entry => (
                                <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-purple-200 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 text-slate-500 font-mono text-xs font-bold px-3 py-2 rounded-lg">
                                                {new Date(entry.date).toLocaleDateString('ar-IQ')}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 font-mono text-lg">{formatCurrency(entry.amount)} <span className="text-xs font-normal text-slate-400">IQD</span></p>
                                                {(entry.receiptNumber || entry.receiptDate) && (
                                                    <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-4">
                                                        {entry.receiptNumber && <span className="flex items-center gap-1 font-semibold"><Icon name="file-text" size={12}/> {entry.receiptNumber}</span>}
                                                        {entry.receiptDate && <span className="flex items-center gap-1 font-semibold"><Icon name="calendar" size={12}/> {new Date(entry.receiptDate).toLocaleDateString('ar-IQ')}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {entry.attachmentUrl && (
                                            <button onClick={() => onPreviewImage({ url: entry.attachmentUrl!, receiptNumber: entry.receiptNumber, receiptDate: entry.receiptDate })} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                                                <Icon name="image-plus" size={16} />
                                                الوصل
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
