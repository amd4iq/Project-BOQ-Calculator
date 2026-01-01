import React from 'react';
// FIX: Corrected import path for types
import { CompanyInfo } from '../../core/types';
import { Icon } from '../Icons';
import { useAppSettings } from '../../contexts/AppSettingsContext';

const InfoInput: React.FC<{
    label: string;
    name: keyof CompanyInfo;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon: string;
}> = ({ label, name, value, onChange, placeholder, icon }) => (
    <div>
        <label htmlFor={name} className="text-sm font-semibold text-slate-700 mb-2 block">{label}</label>
        <div className="relative">
            <Icon name={icon} size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 pr-10 rounded-xl bg-white border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all"
            />
        </div>
    </div>
);

export const CompanyInfoManagement: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  if (!settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            companyInfo: {
                ...prev.companyInfo,
                // FIX: Added type assertion to safely handle dynamic object keys
                [e.target.name as keyof CompanyInfo]: e.target.value
            }
        };
    });
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">معلومات الشركة</h1>
        <p className="text-slate-500 mt-1">
          تعديل البيانات الأساسية للشركة والتي تظهر في رأسية عروض الأسعار المطبوعة.
        </p>
      </header>

      <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <InfoInput
          label="اسم الشركة"
          name="name"
          value={settings.companyInfo.name}
          onChange={handleChange}
          placeholder="مثال: شركة معالم بغداد"
          icon="briefcase"
        />
        <InfoInput
          label="عنوان الشركة"
          name="address"
          value={settings.companyInfo.address}
          onChange={handleChange}
          placeholder="مثال: بغداد - العراق"
          icon="building"
        />
        <InfoInput
          label="رقم الهاتف"
          name="phone"
          value={settings.companyInfo.phone}
          onChange={handleChange}
          placeholder="مثال: 07701234567"
          icon="phone"
        />
        {settings.companyInfo.logoUrl && (
            <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">معاينة الشعار:</p>
                <img src={settings.companyInfo.logoUrl} alt="معاينة الشعار" className="max-h-20 mx-auto" />
            </div>
        )}
      </div>
    </div>
  );
};