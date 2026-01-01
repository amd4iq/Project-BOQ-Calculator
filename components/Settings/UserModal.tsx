import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { User } from '../../core/types';
import { Icon } from '../Icons';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'engineer'>('engineer');
  const [error, setError] = useState('');
  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name);
        setDisplayName(user.displayName || '');
        setPassword(user.password || '');
        setRole(user.role);
      } else {
        setName('');
        setDisplayName('');
        setPassword('');
        setRole('engineer');
      }
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !password.trim() || !displayName.trim()) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }
    onSave({
      id: user ? user.id : '',
      name,
      displayName,
      password,
      role,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {user ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="x" size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">الاسم الكامل (للعرض)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="مثال: احمد الوائلي"
              className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">اسم المستخدم (للدخول)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ahmed.w"
              className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none disabled:bg-slate-200 disabled:text-slate-500"
              disabled={isEditing}
            />
            {isEditing && <p className="text-xs text-slate-400 mt-1">لا يمكن تغيير اسم المستخدم بعد إنشائه.</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">الدور/الصلاحية</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'engineer')}
              className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"
            >
              <option value="engineer">مهندس</option>
              <option value="admin">مدير</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 active:scale-95"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};