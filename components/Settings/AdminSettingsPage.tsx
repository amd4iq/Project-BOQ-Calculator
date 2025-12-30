
import React, { useState } from 'react';
import { Icon } from '../Icons';
import { UserManagement } from './UserManagement';
import { SpecsManagement } from './SpecsManagement';
import { PrintDefaultsManagement } from './PrintDefaultsManagement';
import { CompanyInfoManagement } from './CompanyInfoManagement';
import { FinancialSettings } from './FinancialSettings';
import { TermsManagement } from './TermsManagement';

interface AdminSettingsPageProps {
  onClose: () => void;
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
        className={`flex items-center w-full text-right gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
            isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        <Icon name={icon} size={20} />
        <span>{label}</span>
    </button>
);


export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="flex h-screen bg-slate-100" dir="rtl">
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <Icon name="settings" size={24} className="text-primary-600" />
          <div>
            <h2 className="font-black text-xl text-slate-800">الإعدادات</h2>
            <p className="text-xs text-slate-400">لوحة تحكم المدير</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <NavButton icon="users" label="إدارة المستخدمين" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavButton icon="layers" label="إدارة المواصفات" isActive={activeTab === 'specs'} onClick={() => setActiveTab('specs')} />
            <NavButton icon="printer" label="إعدادات الطباعة" isActive={activeTab === 'print'} onClick={() => setActiveTab('print')} />
            <NavButton icon="building" label="معلومات الشركة" isActive={activeTab === 'company'} onClick={() => setActiveTab('company')} />
            <NavButton icon="dollar-sign" label="الإعدادات المالية" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
            <NavButton icon="file-text" label="الشروط والأحكام" isActive={activeTab === 'terms'} onClick={() => setActiveTab('terms')} />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            عودة
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
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
