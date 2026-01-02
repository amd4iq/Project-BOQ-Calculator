
import React, { useState } from 'react';
import { Icon } from '../Icons';
import { useAuth } from './AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-10">
        <div className="inline-block bg-primary-600/20 text-primary-300 p-4 rounded-2xl mb-4">
          <Icon name="building" size={40} />
        </div>
        <h1 className="text-4xl font-black mb-2 text-white">معالم بغداد للمقاولات</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          يرجى تسجيل الدخول للمتابعة إلى نظام عروض الأسعار.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-400 mb-2 block" htmlFor="username">اسم المستخدم</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="مثال: admin"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-400 mb-2 block" htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl p-4 transition-all duration-300 shadow-lg shadow-primary-600/20 active:scale-95 text-lg"
          >
            تسجيل الدخول
          </button>
        </form>
         <div className="text-center mt-4 text-xs text-slate-500">
            <p>للتجربة: admin/admin123 | engineer/engineer123 | accountant/accountant123</p>
         </div>
      </div>
      
      <footer className="absolute bottom-8 text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} شركة معالم بغداد للمقاولات العامة.
      </footer>
    </div>
  );
};
