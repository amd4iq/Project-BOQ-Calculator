import React from 'react';
import { Icon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewQuote: () => void;
  onGoToArchive: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onNewQuote, onGoToArchive }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center p-8">
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <Icon name="check" size={48} />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mt-6">
            تم إكمال العرض بنجاح!
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            تم اعتماد العرض بنجاح، طباعته، وأرشفته. ما هي خطوتك التالية؟
        </p>

        <div className="mt-8 space-y-3">
            <button
                onClick={onNewQuote}
                className="w-full text-center px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-base"
            >
                <Icon name="plus" size={18} />
                إنشاء عرض سعر جديد
            </button>
            <button
                onClick={onGoToArchive}
                className="w-full text-center px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                 <Icon name="archive" size={16} />
                الانتقال إلى الأرشيف
            </button>
             <button
                onClick={onClose}
                className="w-full text-center px-6 py-2 text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs"
            >
                إغلاق
            </button>
        </div>
        
      </div>
    </div>
  );
};