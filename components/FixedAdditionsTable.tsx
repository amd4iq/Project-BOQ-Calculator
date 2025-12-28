import React, { useState } from 'react';
import { Category } from '../types';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';

interface FixedAdditionsTableProps {
  category: Category;
  selectedIds: string[];
  onSelect: (categoryId: string, optionId: string) => void;
  onEditCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
}

export const FixedAdditionsTable: React.FC<FixedAdditionsTableProps> = ({ 
  category, 
  selectedIds, 
  onSelect,
  onEditCategory,
  onUpdateCategory
}) => {
  const [quickLabel, setQuickLabel] = useState('');
  const [quickCost, setQuickCost] = useState('');

  // Calculate total of selected items
  const selectedTotal = category.options
    .filter(opt => selectedIds.includes(opt.id))
    .reduce((sum, opt) => sum + opt.cost, 0);

  const handleQuickAdd = () => {
    if (!quickLabel.trim()) return;
    const cost = parseFloat(quickCost) || 0;
    
    const newOption = {
        id: `opt-${Date.now()}`,
        label: quickLabel,
        cost: cost,
        costType: 'fixed' as const
    };
    
    const updatedCategory = {
        ...category,
        options: [newOption, ...category.options] // Add to top
    };
    
    onUpdateCategory(updatedCategory);
    setQuickLabel('');
    setQuickCost('');
  };

  const handleDelete = (e: React.MouseEvent, optionId: string) => {
      e.stopPropagation();
      if(!window.confirm('هل أنت متأكد من حذف هذا البند؟')) return;
      
      const updatedCategory = {
          ...category,
          options: category.options.filter(o => o.id !== optionId)
      };
      onUpdateCategory(updatedCategory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleQuickAdd();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl shadow-sm">
             <Icon name="package" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">{category.title}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
               حدد الخدمات أو الإضافات المطلوبة (سعر مقطوع)
            </p>
          </div>
        </div>

        <button 
          onClick={() => onEditCategory(category)}
          className="text-sm bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
           <Icon name="settings" size={16} />
           إدارة القائمة
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/30">
              <th className="px-6 py-3 font-extrabold w-16 text-center">#</th>
              <th className="px-6 py-3 font-extrabold w-1/2">تفاصيل البند / الخدمة</th>
              <th className="px-6 py-3 font-extrabold text-left">السعر الإفرادي</th>
              <th className="px-6 py-3 font-extrabold w-32 text-center">الحالة</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Quick Add Row */}
            <tr className="bg-slate-50/80 border-b border-slate-100 shadow-inner">
                <td className="px-6 py-3 text-center">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                        <Icon name="plus" size={14} />
                    </div>
                </td>
                <td className="px-6 py-3">
                    <input 
                        type="text"
                        value={quickLabel}
                        onChange={(e) => setQuickLabel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="أضف بند جديد هنا..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                </td>
                <td className="px-6 py-3">
                    <input 
                        type="number"
                        value={quickCost}
                        onChange={(e) => setQuickCost(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="السعر"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-mono"
                    />
                </td>
                <td className="px-6 py-3 text-center" colSpan={2}>
                    <button
                        onClick={handleQuickAdd}
                        disabled={!quickLabel.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all"
                    >
                        إضافة
                    </button>
                </td>
            </tr>

            {category.options.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <p>لا توجد بنود مضافة في هذه القائمة.</p>
                    </div>
                 </td>
               </tr>
            ) : (
                category.options.map((option, index) => {
                const isSelected = selectedIds.includes(option.id);
                
                return (
                    <tr 
                    key={option.id}
                    onClick={() => onSelect(category.id, option.id)}
                    className={`
                        group cursor-pointer transition-all duration-200
                        ${isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'hover:bg-slate-50'}
                    `}
                    >
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                        {index + 1}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`font-bold text-base transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {option.label}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                         <span className={`
                            inline-block px-3 py-1 rounded-lg font-mono font-bold text-sm
                            ${isSelected ? 'bg-white text-emerald-600 border border-emerald-100 shadow-sm' : 'text-slate-500 bg-slate-100'}
                         `}>
                             {formatCurrency(option.cost)}
                         </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                         {isSelected ? (
                             <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                                 <Icon name="check" size={12} />
                                 مختار
                             </div>
                         ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                                غير محدد
                            </span>
                         )}
                    </td>
                    <td className="px-4 py-4 text-center">
                        <button
                            onClick={(e) => handleDelete(e, option.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="حذف البند"
                        >
                            <Icon name="trash" size={16} />
                        </button>
                    </td>
                    </tr>
                );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
         <div className="text-xs text-slate-500 font-medium px-2">
             عدد البنود المختارة: <span className="font-bold text-slate-900">{selectedIds.length}</span>
         </div>
         <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-xs font-bold text-slate-500">مجموع الإضافات:</span>
             <span className="text-lg font-black text-emerald-600">{formatCurrency(selectedTotal)}</span>
         </div>
      </div>
    </div>
  );
};