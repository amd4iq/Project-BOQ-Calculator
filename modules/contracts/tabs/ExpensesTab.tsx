
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Contract, Expense } from '../../../core/types.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';

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
    const { addExpense, getContractExpenses } = useContract();
    const expenses = getContractExpenses(contract.id);

    return (
        <div className="p-8 space-y-6">
            <header>
                <h1 className="text-2xl font-black text-slate-800">سجل المصاريف</h1>
                <p className="text-slate-500">متابعة المصروفات والديون الخاصة بالمشروع</p>
            </header>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-right">التاريخ</th>
                            <th className="p-4 text-right">الوصف</th>
                            <th className="p-4 text-right">المبلغ</th>
                            <th className="p-4 text-right">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {expenses.map(exp => (
                            <tr key={exp.id}>
                                <td className="p-4 font-mono">{new Date(exp.date).toLocaleDateString('ar-IQ')}</td>
                                <td className="p-4 font-bold">{exp.description}</td>
                                <td className="p-4 font-mono font-black text-rose-600">{formatCurrency(exp.amount)}</td>
                                <td className="p-4">{exp.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
