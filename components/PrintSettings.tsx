import React from 'react';
import { PrintSettings as PrintSettingsType } from '../types';
import { Icon } from './Icons';

interface PrintSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintSettingsType;
  onChange: (settings: PrintSettingsType) => void;
}

export const PrintSettings: React.FC<PrintSettingsProps> = ({ isOpen, onClose, settings, onChange }) => {

  if (!isOpen) return null;

  const handleChange = (key: keyof PrintSettingsType, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Icon name="settings" className="text-primary-600" />
              إعدادات الطباعة
            </h2>
            <p className="text-sm text-slate-500 mt-1">تخصيص مظهر عرض السعر عند الطباعة او التصدير</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Section: Display Options */}
          <section className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Icon name="layout-template" size={14} />
                محتوى العرض
            </h3>

            {/* Toggle 1: Details */}
            <div 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-primary-200 transition-colors"
                onClick={() => handleChange('showDetails', !settings.showDetails)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.showDetails ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Icon name="file-text" size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-700 text-sm">إظهار التفاصيل المالية</span>
                        <span className="block text-xs text-slate-500 mt-0.5">عرض سعر كل فقرة بشكل منفصل في الجدول</span>
                    </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors relative ${settings.showDetails ? 'bg-primary-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${settings.showDetails ? 'left-1 translate-x-0' : 'left-1 translate-x-5'}`}></div>
                </div>
            </div>

            {/* Toggle 2: Footer */}
            <div 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-primary-200 transition-colors"
                onClick={() => handleChange('showFooter', !settings.showFooter)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.showFooter ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Icon name="pencil" size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-700 text-sm">تذييل الصفحة (التواقيع)</span>
                        <span className="block text-xs text-slate-500 mt-0.5">إظهار أماكن لتوقيع الطرفين في أسفل العرض</span>
                    </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors relative ${settings.showFooter ? 'bg-primary-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${settings.showFooter ? 'left-1 translate-x-0' : 'left-1 translate-x-5'}`}></div>
                </div>
            </div>
          </section>

          {/* Section: Notes */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icon name="file-text" size={14} />
                الملاحظات والشروط
            </h3>
            <div className="relative">
                <textarea
                value={settings.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none min-h-[100px] resize-none transition-all"
                placeholder="اكتب هنا أي ملاحظات إضافية، شروط تعاقدية، أو تفاصيل تريد إظهارها في نهاية عرض السعر..."
                />
                <div className="absolute bottom-3 left-3 text-slate-400 pointer-events-none">
                    <Icon name="pencil" size={14} />
                </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={() => { onClose(); setTimeout(() => window.print(), 300); }}
            className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
          >
            <Icon name="printer" size={18} />
            حفظ وطباعة
          </button>
        </div>
      </div>
    </div>
  );
};