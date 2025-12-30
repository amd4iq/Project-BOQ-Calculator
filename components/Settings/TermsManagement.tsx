
import React from 'react';
import { Icon } from '../Icons';
import { useAppSettings } from '../../contexts/AppSettingsContext';

export const TermsManagement: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  if (!settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            companyInfo: {
                ...prev.companyInfo,
                termsAndConditions: e.target.value
            }
        };
    });
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">الشروط والأحكام</h1>
        <p className="text-slate-500 mt-1">
          تعديل النص الذي يظهر في صفحة الشروط والأحكام النهائية في العروض المطبوعة.
        </p>
      </header>

      <div className="max-w-3xl bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <textarea
          value={settings.companyInfo.termsAndConditions}
          onChange={handleChange}
          rows={15}
          className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all text-sm leading-relaxed"
          placeholder="اكتب كل شرط في سطر منفصل..."
        />
        <p className="text-xs text-slate-400 mt-2 px-1">سيتم ترقيم الأسطر تلقائياً عند الطباعة.</p>
      </div>
    </div>
  );
};
