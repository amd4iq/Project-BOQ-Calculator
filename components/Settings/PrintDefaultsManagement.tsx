import React from 'react';
// FIX: Corrected import path for types
import { PrintSettings } from '../../core/types';
import { Icon } from '../Icons';
import { useAppSettings } from '../../contexts/AppSettingsContext';

const SettingsToggle: React.FC<{
    label: string;
    description: string;
    icon: string;
    isChecked: boolean;
    onToggle: () => void;
}> = ({ label, description, icon, isChecked, onToggle }) => (
    <div 
        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-primary-200 transition-colors hover:bg-slate-50/50"
        onClick={onToggle}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isChecked ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                <Icon name={icon} size={20} />
            </div>
            <div>
                <span className="block font-bold text-slate-700 text-sm">{label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{description}</span>
            </div>
        </div>
        <div className={`w-12 h-7 rounded-full transition-colors relative ${isChecked ? 'bg-primary-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isChecked ? 'left-1 translate-x-5' : 'left-1 translate-x-0'}`}></div>
        </div>
    </div>
);

export const PrintDefaultsManagement: React.FC = () => {
  const { settings, setSettings } = useAppSettings();

  if (!settings) return null;

  const handleChange = (key: keyof PrintSettings, value: any) => {
    setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            defaultPrintSettings: {
                ...prev.defaultPrintSettings,
                [key]: value
            }
        };
    });
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">إعدادات الطباعة الافتراضية</h1>
        <p className="text-slate-500 mt-1">
          تحديد الإعدادات التي سيتم تطبيقها تلقائياً عند إنشاء أي عرض سعر جديد.
        </p>
      </header>

      <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsToggle
            label="التفاصيل المالية"
            description="عرض سعر كل فقرة فنية بشكل منفصل"
            icon="calculator"
            isChecked={!!settings.defaultPrintSettings.showDetails}
            onToggle={() => handleChange('showDetails', !settings.defaultPrintSettings.showDetails)}
        />
        <SettingsToggle
            label="جدول الذرعة"
            description="إظهار تفاصيل حساب مساحة البناء"
            icon="bar-chart"
            isChecked={!!settings.defaultPrintSettings.showAreaBreakdown}
            onToggle={() => handleChange('showAreaBreakdown', !settings.defaultPrintSettings.showAreaBreakdown)}
        />
        <SettingsToggle
            label="المواصفات القياسية"
            description="إظهار قائمة المواصفات الأساسية المشمولة"
            icon="check"
            isChecked={!!settings.defaultPrintSettings.showStandardSpecs}
            onToggle={() => handleChange('showStandardSpecs', !settings.defaultPrintSettings.showStandardSpecs)}
        />
        <SettingsToggle
            label="جدول الدفعات"
            description="إظهار جدول الدفعات المالية للمشروع"
            icon="briefcase"
            isChecked={!!settings.defaultPrintSettings.showPaymentSchedule}
            onToggle={() => handleChange('showPaymentSchedule', !settings.defaultPrintSettings.showPaymentSchedule)}
        />
        <SettingsToggle
            label="الشروط والأحكام"
            description="إظهار صفحة الشروط والأحكام العامة"
            icon="file-text"
            isChecked={!!settings.defaultPrintSettings.showTerms}
            onToggle={() => handleChange('showTerms', !settings.defaultPrintSettings.showTerms)}
        />
        <SettingsToggle
            label="التذييل (التواقيع)"
            description="إظهار أماكن توقيع الطرفين في كل صفحة"
            icon="pencil"
            isChecked={!!settings.defaultPrintSettings.showFooter}
            onToggle={() => handleChange('showFooter', !settings.defaultPrintSettings.showFooter)}
        />
        <SettingsToggle
            label="شعار الشركة"
            description="عرض شعار الشركة في رأسية الصفحة"
            icon="image-plus"
            isChecked={!!settings.defaultPrintSettings.showLogo}
            onToggle={() => handleChange('showLogo', !settings.defaultPrintSettings.showLogo)}
        />
      </div>
    </div>
  );
};