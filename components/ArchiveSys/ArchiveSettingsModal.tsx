
import React from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';

interface ArchiveSettingsModalProps {
  quote: SavedQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuote: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  onDuplicateQuote: (id: string, targetStatus?: QuoteStatus) => void;
  role: 'engineer' | 'admin';
}

export const ArchiveSettingsModal: React.FC<ArchiveSettingsModalProps> = ({ quote, isOpen, onClose, onUpdateQuote, onDuplicateQuote, role }) => {

  if (!isOpen || !quote) return null;

  // Logic: 
  // 1. Pending Client Approval: Both Engineer and Admin can unlock (to fix before client decision).
  // 2. Final Archive (Approved/Rejected/Expired): Only Admin can unlock. Engineer can only duplicate.
  const canRevise = 
      (quote.status === 'Printed - Pending Client Approval') || 
      (role === 'admin' && ['Approved by Client', 'Rejected by Client', 'Expired'].includes(quote.status));
  
  // Determine if it's a signed contract (locked forever, but can be duplicated)
  const isSigned = ['Contract Signed', 'Contract Archived'].includes(quote.status);

  const handleUnlock = () => {
      if (window.confirm('هل أنت متأكد من فتح قفل هذا العرض؟\nسيتم تغيير حالته إلى "قيد المراجعة" وسيظهر في قائمة العروض الحالية للمهندسين.\nسيتم حفظ النسخة الحالية في سجل النسخ (History).')) {
        onUpdateQuote(quote.id, 'Under Revision');
        onClose();
      }
  };

  const handleDuplicate = () => {
      if (window.confirm('هل تريد إنشاء نسخة جديدة تماماً من هذا العرض برقم جديد؟\nلن تتأثر بيانات العقد الحالي.')) {
          // Pass 'Under Revision' so it appears in the Revision Table immediately
          onDuplicateQuote(quote.id, 'Under Revision');
          onClose();
          alert('تم إنشاء نسخة جديدة بنجاح في قسم "عروض قيد المراجعة والتعديل".');
      }
  }

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
            
            {/* Case 1: Active/Reviseable Archive (Pending OR Admin on Final) */}
            {canRevise && (
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg">
                  <div className="flex items-start gap-3">
                      <Icon name="unlock" size={24} className="text-amber-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-base">فتح قفل التعديل (إصدار V{quote.version + 1})</h4>
                        <p className="text-xs mt-1 leading-relaxed opacity-90">
                            يسمح للمهندس بإجراء تعديلات على هذا العرض. سيتم تجميد النسخة الحالية (V{quote.version}) في الأرشيف وإنشاء نسخة جديدة للمراجعة.
                        </p>
                        <button 
                            onClick={handleUnlock}
                            className="mt-3 text-xs font-bold bg-amber-200 text-amber-900 px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors shadow-sm"
                        >
                            فتح القفل والسماح بالتعديل
                        </button>
                      </div>
                  </div>
              </div>
            )}

            {/* Case 2: Allow Duplicate (For Signed, Final, and Pending) */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <Icon name="copy" size={24} className="text-blue-600 mt-1" />
                    <div>
                    <h4 className="font-bold text-base">نسخ كعرض جديد</h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                        {isSigned 
                            ? 'هذا العرض مرتبط بعقد رسمي ولا يمكن تعديله مباشرة. يمكنك إنشاء نسخة جديدة تماماً برقم عرض جديد لبدء مشروع آخر مشابه.'
                            : 'إنشاء نسخة جديدة تماماً من هذا العرض برقم جديد، مع الاحتفاظ بالعرض الحالي كما هو.'
                        }
                    </p>
                    <button 
                        onClick={handleDuplicate}
                        className="mt-3 text-xs font-bold bg-blue-200 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-300 transition-colors shadow-sm"
                    >
                        إنشاء نسخة جديدة
                    </button>
                    </div>
                </div>
            </div>

            {/* If neither unlocked nor signed (Rare, but handles permission denied message) */}
            {!canRevise && !isSigned && role !== 'admin' && (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Icon name="shield-check" size={24} className="mx-auto text-slate-400 mb-2"/>
                    <h3 className="font-bold text-slate-600 text-sm">العرض محمي</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        لا يمكنك فتح قفل هذا العرض المؤرشف. يرجى التواصل مع المدير إذا كان التعديل ضرورياً.
                    </p>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
