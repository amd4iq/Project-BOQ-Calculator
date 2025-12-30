import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { QuoteType } from '../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  defaultName: string;
  quoteType: QuoteType;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onConfirm, defaultName, quoteType }) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName || `قالب ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  const quoteTypeDisplay = quoteType === 'structure' ? 'عرض بناء هيكل' : 'عرض إنهاءات';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Icon name="template" className="text-indigo-600" />
          حفظ القالب الحالي
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          سيتم حفظ الإعدادات والمواصفات الحالية كقالب جديد يمكنك إعادة استخدامه لاحقاً.
        </p>

        <div className="mt-4 text-center bg-slate-50 border border-slate-200 p-2 rounded-lg">
          <span className="text-xs text-slate-500 font-medium">نوع العرض: </span>
          <span className="text-xs font-bold text-slate-700">{quoteTypeDisplay}</span>
        </div>

        <div className="mt-6 space-y-2">
          <label htmlFor="template-name" className="text-sm font-bold text-slate-700">اسم القالب</label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="ادخل اسم القالب"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Icon name="save" size={16} />
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};