import React, { useState, useEffect, useRef } from 'react';
import { CompanyInfo } from '../../core/types';
import { Icon } from '../Icons';
import { useAppSettings } from '../../contexts/AppSettingsContext';

export const CompanyInfoManagement: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  
  const [localInfo, setLocalInfo] = useState<CompanyInfo | null>(settings?.companyInfo || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings?.companyInfo) {
      setLocalInfo(settings.companyInfo);
    }
  }, [settings?.companyInfo]);

  if (!settings || !localInfo) return null;

  const hasChanges = JSON.stringify(localInfo) !== JSON.stringify(settings.companyInfo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInfo(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    if(saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalInfo(prev => prev ? { ...prev, logoUrl: reader.result as string } : null);
        if(saveStatus === 'saved') setSaveStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLocalInfo(prev => prev ? { ...prev, logoUrl: '' } : null);
    if(saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleSave = () => {
    if (hasChanges) {
      setSaveStatus('saving');
      setSettings(prev => prev ? { ...prev, companyInfo: localInfo } : null);
      setTimeout(() => setSaveStatus('saved'), 1000);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">معلومات الشركة</h1>
        <p className="text-slate-500 mt-1">
          تعديل البيانات الأساسية للشركة والتي تظهر في رأسية عروض الأسعار المطبوعة.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-lg text-slate-800 -mb-2">البيانات الأساسية</h3>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">اسم الشركة</label>
            <div className="relative"><Icon name="briefcase" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" name="name" value={localInfo.name} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"/></div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">عنوان الشركة</label>
            <div className="relative"><Icon name="building" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" name="address" value={localInfo.address} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"/></div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">رقم الهاتف</label>
            <div className="relative"><Icon name="phone" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" name="phone" value={localInfo.phone} onChange={handleChange} className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"/></div>
          </div>
        </div>

        {/* Right Column: Logo Management */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-lg text-slate-800 mb-4">شعار الشركة</h3>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml" className="hidden" />
            {localInfo.logoUrl ? (
                <div className="space-y-4">
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center h-32">
                        <img src={localInfo.logoUrl} alt="معاينة الشعار" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg">تغيير</button>
                        <button onClick={handleRemoveLogo} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"><Icon name="trash" size={16} /></button>
                    </div>
                </div>
            ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Icon name="image-plus" size={32} />
                    <span className="font-bold text-sm mt-2">تحميل شعار</span>
                </button>
            )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg
                ${!hasChanges || saveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'}
                ${hasChanges ? 'active:scale-95' : 'cursor-default'}
            `}
          >
            {saveStatus === 'saved' ? <Icon name="check" size={18} /> : <Icon name="save" size={18} />}
            {saveStatus === 'saved' ? 'تم الحفظ' : 'حفظ التغييرات'}
          </button>
      </div>
    </div>
  );
};