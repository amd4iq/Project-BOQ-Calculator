
import React from 'react';
import { Icon } from './Icons';

interface PrintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOpenSettings: () => void;
}

export const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({ isOpen, onClose, onConfirm, onOpenSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center p-8">
        
        <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary-50">
            <Icon name="printer" size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mt-6">
            تأكيد الإعتماد والطباعة
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            هل أنت متأكد من رغبتك في المتابعة؟ سيتم قفل هذا العرض وتحويله إلى الأرشيف بعد اكتمال عملية الطباعة.
        </p>

        <div className="mt-8 space-y-3">
            <button
                onClick={onConfirm}
                className="w-full text-center px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-base"
            >
                <Icon name="check" size={18} />
                نعم، اعتمد واطبع
            </button>
            <button
                onClick={onOpenSettings}
                className="w-full text-center px-6 py-3 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                 <Icon name="settings" size={16} />
                إعدادات طباعة هذا العرض
            </button>
             <button
                onClick={onClose}
                className="w-full text-center px-6 py-2 text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs"
            >
                إلغاء
            </button>
        </div>
        
      </div>
    </div>
  );
};
