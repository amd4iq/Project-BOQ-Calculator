
import React from 'react';
import { Icon } from './Icons.tsx';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ isOpen, onClose, onDiscard, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center p-8">
        
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
            <Icon name="alert" size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mt-6">
            تنبيه: عرض غير مكتمل
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            لم يتم اعتماد وطباعة هذا العرض بعد. ماذا تريد أن تفعل قبل الخروج؟
        </p>

        <div className="mt-8 space-y-3">
            <button
                onClick={onSave}
                className="w-full text-center px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-base"
            >
                <Icon name="save" size={18} />
                حفظ في العروض الجارية والخروج
            </button>
            <button
                onClick={onDiscard}
                className="w-full text-center px-6 py-3 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                 <Icon name="trash" size={16} />
                 إلغاء العرض وحذفه
            </button>
             <button
                onClick={onClose}
                className="w-full text-center px-6 py-2 text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs"
            >
                البقاء في الصفحة
            </button>
        </div>
        
      </div>
    </div>
  );
};
