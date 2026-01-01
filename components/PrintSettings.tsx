import React from 'react';
// FIX: Corrected import path for types
import { PrintSettings as PrintSettingsType } from '../core/types';
import { Icon } from './Icons';

interface PrintSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintSettingsType;
  onChange: (settings: PrintSettingsType) => void;
}

const Toggle: React.FC<{
    label: string;
    icon: string;
    isChecked: boolean;
    onToggle: () => void;
}> = ({ label, icon, isChecked, onToggle }) => (
    <div 
        className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:border-primary-200 transition-colors"
        onClick={onToggle}
    >
        <div className="flex items-center gap-2">
            <Icon name={icon} size={16} className={isChecked ? 'text-primary-600' : 'text-slate-500'} />
            <span className="font-bold text-slate-700 text-sm">{label}</span>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors relative ${isChecked ? 'bg-primary-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isChecked ? 'left-0.5 translate-x-4' : 'left-0.5 translate-x-0'}`}></div>
        </div>
    </div>
);


export const PrintSettings: React.FC<PrintSettingsProps> = ({ isOpen, onClose, settings, onChange }) => {

  if (!isOpen) return null;

  const handleChange = (key: keyof PrintSettingsType, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center p-5 border-b border-slate-100 bg-white">
          <Icon name="settings" size={20} className="text-primary-600" />
          <div className="mr-3">
            <h2 className="text-lg font-bold text-slate-800">إعدادات الطباعة</h2>
            <p className="text-xs text-slate-500">تخصيص محتوى عرض السعر للطباعة</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-3">
            <Toggle
                label="التفاصيل المالية"
                icon="calculator"
                isChecked={!!settings.showDetails}
                onToggle={() => handleChange('showDetails', !settings.showDetails)}
            />
             <Toggle
                label="جدول الذرعة"
                icon="bar-chart"
                isChecked={!!settings.showAreaBreakdown}
                onToggle={() => handleChange('showAreaBreakdown', !settings.showAreaBreakdown)}
            />
            <Toggle
                label="المواصفات القياسية"
                icon="check"
                isChecked={!!settings.showStandardSpecs}
                onToggle={() => handleChange('showStandardSpecs', !settings.showStandardSpecs)}
            />
            <Toggle
                label="جدول الدفعات"
                icon="briefcase"
                isChecked={!!settings.showPaymentSchedule}
                onToggle={() => handleChange('showPaymentSchedule', !settings.showPaymentSchedule)}
            />
            <Toggle
                label="الشروط والأحكام"
                icon="file-text"
                isChecked={!!settings.showTerms}
                onToggle={() => handleChange('showTerms', !settings.showTerms)}
            />
            <Toggle
                label="التذييل (التواقيع)"
                icon="pencil"
                isChecked={!!settings.showFooter}
                onToggle={() => handleChange('showFooter', !settings.showFooter)}
            />
             <Toggle
                label="شعار الشركة"
                icon="image-plus"
                isChecked={!!settings.showLogo}
                onToggle={() => handleChange('showLogo', !settings.showLogo)}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="check" size={18} />
            العودة للتأكيد
          </button>
        </div>
      </div>
    </div>
  );
};