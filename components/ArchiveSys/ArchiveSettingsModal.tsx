
import React, { useState, useEffect } from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';

interface ArchiveSettingsModalProps {
  quote: SavedQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuote: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  role: 'engineer' | 'admin';
}

export const ArchiveSettingsModal: React.FC<ArchiveSettingsModalProps> = ({ quote, isOpen, onClose, onUpdateQuote, role }) => {
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [contractDate, setContractDate] = useState('');

  useEffect(() => {
      if (quote) {
        setAssignedEngineer(quote.projectDetails.assignedEngineer || '');
        // Assuming contract date might be stored somewhere in the future
        setContractDate(''); 
      }
  }, [quote]);


  if (!isOpen || !quote) return null;

  const handleSaveChanges = () => {
    const updates: Partial<SavedQuote> = {
        projectDetails: {
            ...quote.projectDetails,
            assignedEngineer: assignedEngineer
        }
    };
    // We pass the quote's current status because we are only updating data, not the status itself.
    onUpdateQuote(quote.id, quote.status, updates);
    onClose();
  };

  const handleUnlock = () => {
      if (window.confirm('هل أنت متأكد من فتح قفل هذا العرض؟ سيتم تغيير حالته إلى "قيد المراجعة" وسيظهر في قائمة العروض الحالية للمهندسين.')) {
        onUpdateQuote(quote.id, 'Under Revision');
        onClose();
      }
  };


  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Icon name="settings" className="text-indigo-600" />
              إعدادات العرض
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                إدارة عرض السعر المؤرشف رقم: <span className="font-bold font-mono text-indigo-700">{quote.offerNumber}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            <div className="space-y-2">
                <label htmlFor="assigned-engineer" className="text-sm font-bold text-slate-700">المهندس المسؤول عن المشروع</label>
                <select 
                    id="assigned-engineer"
                    value={assignedEngineer}
                    onChange={(e) => setAssignedEngineer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                >
                    <option value="">لم يتم التعيين</option>
                    <option value="المهندس علي كريم">المهندس علي كريم</option>
                    <option value="المهندس محمد احمد">المهندس محمد احمد</option>
                    <option value="المهندسة فاطمة الزهراء">المهندسة فاطمة الزهراء</option>
                </select>
                <p className="text-xs text-slate-400 px-1">سيتم إرسال إشعار للمهندس المختار.</p>
            </div>
            
             <div className="space-y-2">
                <label htmlFor="contract-date" className="text-sm font-bold text-slate-700">تاريخ توقيع العقد</label>
                <input
                    type="date"
                    id="contract-date"
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all font-mono"
                />
            </div>

            {role === 'admin' && (
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800">
                  <h4 className="font-bold">فتح قفل التعديل</h4>
                  <p className="text-xs mt-1">
                      يمكنك السماح للمهندس بإجراء تعديلات على هذا العرض وإنشاء نسخة جديدة (V2). سيتم تجميد النسخة الحالية في الأرشيف.
                  </p>
                   <button 
                      onClick={handleUnlock}
                      className="mt-3 text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1.5 rounded-md hover:bg-amber-300 transition-colors"
                   >
                      السماح بالتعديل
                  </button>
              </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Icon name="save" size={16} />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};