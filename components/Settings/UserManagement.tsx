import React, { useState } from 'react';
// FIX: Corrected import path for types
import { User } from '../../core/types';
import { useAuth } from '../Auth/AuthContext';
import { Icon } from '../Icons';
import { UserModal } from './UserModal';

export const UserManagement: React.FC = () => {
  const { users, updateUsers } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = (userToSave: User) => {
    let updatedUsers;
    if (userToSave.id && users.some(u => u.id === userToSave.id)) {
      // Edit existing user
      updatedUsers = users.map(u => u.id === userToSave.id ? userToSave : u);
    } else {
      // Add new user
      updatedUsers = [...users, { ...userToSave, id: `user-${Date.now()}` }];
    }
    updateUsers(updatedUsers);
    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
        alert("لا يمكن حذف المستخدم الأخير.");
        return;
    }
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      updateUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <>
      <div>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 leading-tight">إدارة المستخدمين</h1>
            <p className="text-slate-500 mt-1">إضافة، تعديل، وحذف حسابات المستخدمين في النظام.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 active:scale-95"
          >
            <Icon name="plus" size={18} />
            إضافة مستخدم
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 border-b-2 border-slate-200">
              <tr>
                <th className="p-4 font-extrabold text-slate-600 text-right w-2/5">الاسم</th>
                <th className="p-4 font-extrabold text-slate-600 text-right w-1/5">الدور/الصلاحية</th>
                <th className="p-4 font-extrabold text-slate-600 text-right w-2/5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                      <p className="font-bold text-slate-800">{user.displayName || user.name}</p>
                      <p className="text-xs text-slate-400 font-mono">@{user.name}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {user.role === 'admin' ? 'مدير' : 'مهندس'}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(user)} className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors">
                            <Icon name="pencil" size={14} /> تعديل
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="flex items-center gap-1.5 text-xs font-bold bg-white text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50 transition-colors">
                            <Icon name="trash" size={14} /> حذف
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <UserModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </>
  );
};