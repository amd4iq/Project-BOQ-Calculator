
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../../core/types.ts';
import { defaultUsers } from './users.ts';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUsers: (users: User[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth_current_user_id';
const USERS_STORAGE_KEY = 'app_users';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    // تم التعديل هنا: إذا لم يوجد مستخدم مسجل، سيتم اختيار الأدمن (user-1) تلقائياً للتجربة
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY) || 'user-1';
    if (savedUserId) {
      const user = users.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
        // حفظ المعرف في الـ storage لضمان استمرارية الجلسة الافتراضية
        if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
            localStorage.setItem(AUTH_STORAGE_KEY, user.id);
        }
      }
    }
  }, [users]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.name === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };
  
  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, updateUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
