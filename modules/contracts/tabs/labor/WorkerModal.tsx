
import React, { useState, useEffect } from 'react';
import { Worker } from '../../../../core/types';
import { Icon } from '../../../../components/Icons';

interface WorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (worker: Worker) => void;
    worker: Worker | null;
}

export const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose, onSave, worker }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('');
    const [dailyWage, setDailyWage] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const isEditing = !!worker;

    useEffect(() => {
        if (isOpen) {
            if (worker) {
                setName(worker.name);
                setPhone(worker.phone);
                setAddress(worker.address || '');
                setRole(worker.role || '');
                setDailyWage(worker.dailyWage || '');
                setNotes(worker.notes || '');
            } else {
                setName('');
                setPhone('');
                setAddress('');
                setRole('');
                setDailyWage('');
                setNotes('');
            }
            setError('');
        }
    }, [isOpen, worker]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim() || !role.trim()) {
            setError('الاسم، رقم الهاتف، والدور هي حقول مطلوبة.');
            return;
        }
        onSave({
            id: worker ? worker.id : '',
            name, phone, role,
            dailyWage: Number(dailyWage) || 0,
            address, notes
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'تعديل بيانات العامل' : 'إضافة عامل أو حرفي جديد'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">اسم العامل</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">رقم الهاتف</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">الدور أو الحرفة</label>
                            <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="مثال: بنّاء، كهربائي..." className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">الأجرة اليومية (اختياري)</label>
                            <input type="number" value={dailyWage} onChange={e => setDailyWage(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">العنوان (اختياري)</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">ملاحظات (اختياري)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">إلغاء</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">حفظ</button>
                </div>
            </div>
        </div>
    );
};
