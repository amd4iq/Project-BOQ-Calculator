
// FIX: Corrected import path for types
import { User } from '../../core/types';

export const defaultUsers: User[] = [
  {
    id: 'user-1',
    name: 'admin',
    displayName: 'احمد الوائلي',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 'user-2',
    name: 'engineer',
    displayName: 'مهندس تجريبي',
    role: 'engineer',
    password: 'engineer123'
  },
  {
    id: 'user-3',
    name: 'accountant',
    displayName: 'محاسب تجريبي',
    role: 'accountant',
    password: 'accountant123'
  },
];
