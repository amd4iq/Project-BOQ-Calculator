
import React, { useState, useEffect } from 'react';
import { Supplier } from '../../../../core/types';
import { Icon } from '../../../../components/Icons';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    supplier: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplier }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const isEditing = !!supplier;

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                setName(supplier.name);
                setPhone(supplier.phone);
                setAddress(supplier.address || '');
                setSpecialty(supplier.specialty || '');
                setNotes(supplier.notes || '');
            } else {
                setName('');
                setPhone('');
                setAddress('');
                setSpecialty('');
                setNotes('');
            }
            setError('');
        }
    }, [isOpen, supplier]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim() || !specialty.trim()) {
            setError('الاسم، رقم الهاتف، والاختصاص هي حقول مطلوبة.');
            return;
        }
        onSave({
            id: supplier ? supplier.id : '',
            name, phone, specialty, address, notes
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">اسم المورد</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 block">رقم الهاتف</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">الاختصاص</label>
                        <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="مثال: مواد بناء، كهربائيات..." className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
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
