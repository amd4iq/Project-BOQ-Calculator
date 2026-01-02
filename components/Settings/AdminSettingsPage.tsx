import React, { useState } from 'react';
import { Icon } from '../Icons';
import { UserManagement } from './UserManagement';
import { SpecsManagement } from './SpecsManagement';
import { PrintDefaultsManagement } from './PrintDefaultsManagement';
import { CompanyInfoManagement } from './CompanyInfoManagement';
import { FinancialSettings } from './FinancialSettings';
import { TermsManagement } from './TermsManagement';
import { useAuth } from '../Auth/AuthContext';

interface AdminSettingsPageProps {
  onClose: () => void;
  onGoToArchive: () => void;
  onGoToContracts: () => void;
}

type Tab = 'users' | 'specs' | 'print' | 'company' | 'financial' | 'terms';

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-right px-3 py-2.5 rounded-lg transition-colors group text-sm ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-semibold'
        }`}
    >
        <Icon name={icon} size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500 transition-colors'} />
        <span>{label}</span>
    </button>
);

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onClose, onGoToArchive, onGoToContracts }) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-100" dir="rtl">
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
            <Icon name="settings" size={20} />
          </div>
          <h2 className="font-black text-lg text-slate-800">الإعدادات</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-gutter-stable">
            <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الأقسام</div>
            <NavButton icon="users" label="إدارة المستخدمين" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavButton icon="layers" label="إدارة المواصفات" isActive={activeTab === 'specs'} onClick={() => setActiveTab('specs')} />
            <NavButton icon="printer" label="إعدادات الطباعة" isActive={activeTab === 'print'} onClick={() => setActiveTab('print')} />
            <NavButton icon="building" label="معلومات الشركة" isActive={activeTab === 'company'} onClick={() => setActiveTab('company')} />
            <NavButton icon="dollar-sign" label="الإعدادات المالية" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
            <NavButton icon="file-text" label="الشروط والأحكام" isActive={activeTab === 'terms'} onClick={() => setActiveTab('terms')} />
        </nav>
        <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-around">
                <button onClick={onClose} title="الرئيسية" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                    <Icon name="home" size={20} />
                </button>
                <button onClick={onGoToContracts} title="إدارة العقود" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                    <Icon name="briefcase" size={20} />
                </button>
                <button onClick={onGoToArchive} title="الأرشيف" className="p-3 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                    <Icon name="archive" size={20} />
                </button>
                <button disabled title="الإعدادات" className="p-3 text-indigo-600 bg-indigo-100 rounded-lg">
                    <Icon name="settings" size={20} />
                </button>
                <button onClick={logout} title="خروج" className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Icon name="log-out" size={20} />
                </button>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 scrollbar-gutter-stable">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'specs' && <SpecsManagement />}
        {activeTab === 'print' && <PrintDefaultsManagement />}
        {activeTab === 'company' && <CompanyInfoManagement />}
        {activeTab === 'financial' && <FinancialSettings />}
        {activeTab === 'terms' && <TermsManagement />}
      </main>
    </div>
  );
};
