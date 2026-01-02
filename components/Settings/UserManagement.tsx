
import React, { useState } from 'react';
import { User } from '../../core/types.ts';
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
      updatedUsers = users.map(u => u.id === userToSave.id ? userToSave : u);
    } else {
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

  const getRoleStyle = (role: User['role']) => {
      switch(role) {
          case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
          case 'accountant': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          case 'engineer':
          default:
              return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };
  const getRoleLabel = (role: User['role']) => {
    switch(role) {
        case 'admin': return 'مدير';
        case 'accountant': return 'محاسب';
        case 'engineer': return 'مهندس';
        default: return role;
    }
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{user.displayName || user.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRoleStyle(user.role)}`}>
                        {getRoleLabel(user.role)}
                    </span>
                </div>
                <p className="text-sm text-slate-400 font-mono">@{user.name}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="حذف"
                >
                  <Icon name="trash" size={18} />
                </button>
                <button 
                  onClick={() => handleOpenModal(user)}
                  className="flex items-center gap-2 text-sm font-bold bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors"
                >
                  <Icon name="pencil" size={14} /> 
                  تعديل
                </button>
              </div>
            </div>
          ))}
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
