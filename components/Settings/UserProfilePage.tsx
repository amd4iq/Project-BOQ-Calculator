
import React from 'react';
import { useAuth } from '../Auth/AuthContext';
import { Icon } from '../Icons';

interface UserProfilePageProps {
  onClose: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onClose }) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-slate-50">
          <Icon name="user" size={48} className="text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mt-6">{currentUser.name}</h1>
        <p className={`mt-2 text-sm font-bold px-4 py-1.5 rounded-full inline-block border ${currentUser.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {currentUser.role === 'admin' ? 'مدير النظام' : 'مهندس'}
        </p>
        
        <div className="mt-8 space-y-3">
          <button
            onClick={onClose}
            className="w-full text-center px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-base"
          >
            <Icon name="home" size={18} />
            العودة للرئيسية
          </button>
          <button
            onClick={logout}
            className="w-full text-center px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Icon name="log-out" size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};
