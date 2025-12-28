import React, { useState, useRef, useEffect } from 'react';
import { StandardSpec } from '../types';
import { Icon } from './Icons';

interface StandardSpecsProps {
  specs: StandardSpec[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
}

export const StandardSpecs: React.FC<StandardSpecsProps> = ({ specs, onAdd, onDelete, onUpdate }) => {
  // Quick Add State
  const [quickText, setQuickText] = useState('');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [editingId]);

  const handleQuickAdd = () => {
    if (quickText.trim()) {
      onAdd(quickText.trim());
      setQuickText('');
    }
  };

  const handleQuickKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleQuickAdd();
  };

  // -- Edit Logic --
  const startEdit = (spec: StandardSpec) => {
    setEditingId(spec.id);
    setEditingText(spec.text);
  };

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdate(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shadow-sm">
             <Icon name="check" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">المواصفات القياسية</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
               البنود والمواصفات المشمولة ضمن السعر الأساسي
            </p>
          </div>
        </div>

        <div className="bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm">
            <Icon name="zap" size={14} className="fill-current" />
            <span>مجاني (ضمن العقد)</span>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/30">
              <th className="px-6 py-3 font-extrabold w-16 text-center">#</th>
              <th className="px-6 py-3 font-extrabold">تفاصيل المواصفة</th>
              <th className="px-6 py-3 font-extrabold w-40 text-center">الحالة</th>
              <th className="px-4 py-3 w-24 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            
            {/* Quick Add Row */}
            <tr className="bg-slate-50/80 border-b border-slate-100 shadow-inner">
                <td className="px-6 py-3 text-center">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Icon name="plus" size={14} />
                    </div>
                </td>
                <td className="px-6 py-3">
                    <input 
                        type="text"
                        value={quickText}
                        onChange={(e) => setQuickText(e.target.value)}
                        onKeyDown={handleQuickKeyDown}
                        placeholder="أضف مواصفة قياسية جديدة..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                </td>
                <td className="px-6 py-3 text-center">
                    <span className="text-[10px] text-slate-400 font-medium">--</span>
                </td>
                <td className="px-4 py-3 text-center">
                    <button
                        onClick={handleQuickAdd}
                        disabled={!quickText.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all"
                    >
                        إضافة
                    </button>
                </td>
            </tr>

            {/* Empty State */}
            {specs.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Icon name="template" size={32} className="opacity-20" />
                        <p>لا توجد مواصفات مضافة حالياً.</p>
                    </div>
                 </td>
               </tr>
            )}

            {/* List Items */}
            {specs.map((spec, index) => (
                <tr 
                key={spec.id}
                className={`
                    group transition-all duration-200 hover:bg-slate-50
                    ${editingId === spec.id ? 'bg-blue-50/50' : ''}
                `}
                >
                <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                    {index + 1}
                </td>
                
                <td className="px-6 py-4">
                    {editingId === spec.id ? (
                        <input 
                            ref={editInputRef}
                            type="text" 
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    ) : (
                        <span className="font-bold text-base text-slate-700 leading-relaxed">
                            {spec.text}
                        </span>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                         <Icon name="check" size={12} />
                         ضمن العقد
                     </div>
                </td>

                <td className="px-4 py-4 text-center">
                    {editingId === spec.id ? (
                        <div className="flex items-center justify-center gap-1">
                            <button onClick={saveEdit} className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"><Icon name="check" size={14} /></button>
                            <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200"><Icon name="x" size={14} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEdit(spec)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="تعديل"
                            >
                                <Icon name="pencil" size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if(window.confirm('هل أنت متأكد من حذف هذه المواصفة؟')) onDelete(spec.id);
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="حذف"
                            >
                                <Icon name="trash" size={16} />
                            </button>
                        </div>
                    )}
                </td>
                </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
         <div className="text-xs text-slate-500 font-medium px-2">
             عدد المواصفات القياسية: <span className="font-bold text-slate-900">{specs.length}</span>
         </div>
      </div>
    </div>
  );
};