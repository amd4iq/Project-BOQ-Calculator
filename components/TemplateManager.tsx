
import React, { useState } from 'react';
import { QuoteTemplate } from '../types';
import { Icon } from './Icons';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: QuoteTemplate[];
  onSave: (name: string) => void;
  onApply: (templateId: string) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  onClose,
  templates,
  onSave,
  onApply,
  onDelete,
}) => {
  const [newTemplateName, setNewTemplateName] = useState('');

  const handleSave = () => {
    if (newTemplateName.trim()) {
      onSave(newTemplateName.trim());
      setNewTemplateName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Icon name="template" className="text-primary-600" />
              إدارة القوالب
            </h2>
            <p className="text-sm text-slate-500 mt-1">حفظ واستخدام مجموعات من المواصفات مسبقاً</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Saved Templates List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">القوالب المحفوظة</h3>
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-center text-sm text-slate-400 p-8 bg-slate-50 rounded-xl">لا توجد قوالب محفوظة.</p>
              ) : (
                templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                    <span className="font-bold text-slate-700">{template.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDelete(template.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="حذف القالب"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                      <button 
                        onClick={() => onApply(template.id)}
                        className="px-4 py-1.5 text-sm font-bold text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg"
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Save Current as Template */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">حفظ القالب الحالي</h3>
            <div className="flex gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="اسم القالب الجديد (مثال: تشطيب تجاري)"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={handleSave}
                disabled={!newTemplateName.trim()}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 disabled:bg-slate-300 transition-all text-sm"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
