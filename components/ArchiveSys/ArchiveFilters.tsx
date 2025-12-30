import React, { useState } from 'react';
import { Icon } from '../Icons';

interface ArchiveFiltersProps {
  onFilterChange: (filters: any) => void;
}

export const ArchiveFilters: React.FC<ArchiveFiltersProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
      <div className="relative w-full md:w-1/3">
        <Icon name="search" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث برقم العرض أو اسم العميل..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all placeholder:text-slate-400 font-medium"
        />
      </div>
      <div className="w-full md:w-1/4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
        >
          <option value="">كل الحالات</option>
          <option value="Printed - Pending Client Approval">بانتظار قرار العميل</option>
          <option value="Approved by Client">موافق عليه</option>
          <option value="Rejected by Client">مرفوض</option>
          <option value="Expired">منتهي الصلاحية</option>
        </select>
      </div>
       <button className="w-full md:w-auto px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all text-sm">
        تطبيق الفلتر
      </button>
    </div>
  );
};
