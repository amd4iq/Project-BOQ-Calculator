
import React from 'react';
import { Icon } from '../../../components/Icons.tsx';
import { QuoteType } from '../../../core/types.ts';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';

interface QuoteTypeSelectorProps {
  onSelect: (type: QuoteType) => void;
  onGoToArchive: () => void;
  onGoToSettings: () => void;
  onGoToContracts: () => void;
}

export const QuoteTypeSelector: React.FC<QuoteTypeSelectorProps> = ({ onSelect, onGoToArchive, onGoToSettings, onGoToContracts }) => {
  const { logout, currentUser } = useAuth();

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-12">
        <div className="inline-block bg-primary-600/20 text-primary-300 p-4 rounded-2xl mb-4">
            <Icon name="building" size={40} />
        </div>
        <h1 className="text-4xl font-black mb-2 text-white">أهلاً بك في حاسبة معالم بغداد</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          يرجى اختيار نوع عرض السعر الذي تود إنشاءه. سيقوم النظام بتحميل الإعدادات والمواصفات المناسبة لاختيارك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Structure Option */}
        <div 
            onClick={() => onSelect('structure')}
            className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 hover:bg-slate-700 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-600/20 hover:-translate-y-2 group"
        >
          <Icon name="layers" size={48} className="mx-auto mb-6 text-slate-400 group-hover:text-primary-400 transition-colors" />
          <h2 className="text-2xl font-bold mb-2 text-white">عرض بناء هيكل</h2>
          <p className="text-slate-400">
            حساب تكاليف بناء الهيكل الإنشائي للمشروع، بما في ذلك المواد الأساسية والأعمال الإنشائية.
          </p>
        </div>

        {/* Finishes Option */}
        <div 
            onClick={() => onSelect('finishes')}
            className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 hover:bg-slate-700 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/20 hover:-translate-y-2 group"
        >
          <Icon name="paint" size={48} className="mx-auto mb-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <h2 className="text-2xl font-bold mb-2 text-white">عرض إنهاءات</h2>
          <p className="text-slate-400">
            حساب تكاليف التشطيبات النهائية للمشروع، من الأرضيات والجدران إلى التأسيسات الصحية والكهربائية.
          </p>
        </div>
      </div>

      <footer className="absolute bottom-8 left-8 right-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
             {(currentUser?.role === 'admin' || currentUser?.role === 'accountant') && (
                <button
                    onClick={onGoToContracts}
                    className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 hover:text-white py-2 px-4 rounded-xl font-bold text-sm transition-all border border-indigo-500/30"
                >
                    <Icon name="briefcase" size={16} />
                    العقود والمشاريع
                </button>
            )}
            <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div>
            <button
                onClick={onGoToArchive}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white py-2 px-4 rounded-xl font-bold text-sm transition-all"
            >
                <Icon name="archive" size={16} />
                الأرشيف
            </button>
            <button
                onClick={onGoToSettings}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white py-2 px-4 rounded-xl font-bold text-sm transition-all"
            >
                <Icon name="settings" size={16} />
                الإعدادات
            </button>
            <button
                onClick={logout}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white py-2 px-4 rounded-xl font-bold text-sm transition-all"
            >
                <Icon name="log-out" size={16} />
                تسجيل الخروج
            </button>
        </div>
        <div className="text-center text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} شركة معالم بغداد للمقاولات العامة.
        </div>
      </footer>
    </div>
  );
};
