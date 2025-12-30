
import React from 'react';
import { BasePrices } from '../../types';
import { Icon } from '../Icons';
import { useAppSettings } from '../../contexts/AppSettingsContext';

const PriceInput: React.FC<{
    label: string;
    description: string;
    name: keyof BasePrices;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: string;
}> = ({ label, description, name, value, onChange, icon }) => (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 text-primary-600 p-2.5 rounded-xl">
                <Icon name={icon} size={22} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">{label}</h3>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
        <div className="relative">
            <input
                type="number"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full p-4 pr-12 rounded-xl bg-slate-50 border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all text-xl font-black text-slate-800"
            />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">IQD</span>
        </div>
    </div>
);

export const FinancialSettings: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  if (!settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            basePrices: {
                ...prev.basePrices,
                [e.target.name]: Number(e.target.value) || 0
            }
        };
    });
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">الإعدادات المالية</h1>
        <p className="text-slate-500 mt-1">
          التحكم في الأسعار الأساسية التي يعتمد عليها النظام لحساب تكاليف المشاريع الجديدة.
        </p>
      </header>

      <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <PriceInput
            label="السعر الأساسي للهيكل"
            description="سعر المتر المربع الافتراضي لعروض بناء الهيكل."
            name="structure"
            value={settings.basePrices.structure}
            onChange={handleChange}
            icon="layers"
        />
        <PriceInput
            label="السعر الأساسي للإنهاءات"
            description="سعر المتر المربع الافتراضي لعروض الإنهاءات."
            name="finishes"
            value={settings.basePrices.finishes}
            onChange={handleChange}
            icon="paint"
        />
      </div>
    </div>
  );
};
