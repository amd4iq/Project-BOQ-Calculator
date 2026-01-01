import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { Category, Option, CostType } from '../core/types';
import { Icon } from './Icons';

interface CategoryEditorProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  onLiveUpdate: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  isReadOnly: boolean;
}

export const CategoryEditor: React.FC<CategoryEditorProps> = ({ 
  category, 
  isOpen, 
  onClose, 
  onSave,
  onLiveUpdate,
  onDelete,
  isReadOnly
}) => {
  const [tempId, setTempId] = useState('');
  const [title, setTitle] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState('');
  
  const labelInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevOptionsLength = useRef(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && !isReadOnly) {
      labelInputRefs.current = [];
      if (category) {
        setTempId(category.id);
        setTitle(category.title);
        setAllowMultiple(!!category.allowMultiple);
        setOptions(category.options.map(o => ({...o, costType: o.costType || 'per_m2'})));
        prevOptionsLength.current = category.options.length;
      } else {
        setTempId(`cat-${Date.now()}`);
        setTitle('');
        setAllowMultiple(false);
        const initialOpts: Option[] = [{ id: `opt-${Date.now()}-1`, label: '', cost: 0, costType: 'per_m2' }];
        setOptions(initialOpts);
        prevOptionsLength.current = initialOpts.length;
      }
      setError('');
      isInitialized.current = true;
    } else {
      isInitialized.current = false;
    }
  }, [isOpen, category, isReadOnly]);

  useEffect(() => {
    if (!isOpen || !isInitialized.current || isReadOnly) return;

    const currentCategory: Category = {
      id: tempId,
      title: title,
      iconName: category ? category.iconName : 'layers',
      allowMultiple: allowMultiple,
      options: options.map(opt => ({
        ...opt,
        cost: Number(opt.cost) || 0
      }))
    };

    onLiveUpdate(currentCategory);
  }, [title, options, tempId, category, isOpen, onLiveUpdate, allowMultiple, isReadOnly]);

  useEffect(() => {
    if (options.length > prevOptionsLength.current) {
      const lastIndex = options.length - 1;
      const el = labelInputRefs.current[lastIndex];
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    prevOptionsLength.current = options.length;
  }, [options.length]);

  if (!isOpen || isReadOnly) return null;

  const handleAddOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, label: '', cost: 0, costType: 'per_m2' }]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى ادخال عنوان للمواصفة');
      return;
    }
    if (options.length === 0 || options.some(o => !o.label.trim())) {
      setError('يرجى اضافة خيار واحد على الاقل وتسميته');
      return;
    }

    const finalCategory: Category = {
      id: tempId,
      title,
      iconName: category ? category.iconName : 'layers',
      allowMultiple: allowMultiple,
      options: options.map(opt => ({
        ...opt,
        cost: Number(opt.cost)
      }))
    };

    onSave(finalCategory);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {category ? 'تعديل مواصفة' : 'اضافة مواصفة جديدة'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">عنوان المواصفة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: نوع الزجاج"
              className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              autoComplete="off"
            />
          </div>

           {/* Allow Multiple Toggle */}
           <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="allowMultiple" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
              السماح باختيار أكثر من عنصر (Multi-select)
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                مفيد للإضافات الاختيارية التي يمكن جمعها معاً (مثل الملحقات)
              </p>
            </label>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <label className="text-sm font-semibold text-slate-700">الخيارات والأسعار</label>
               <button 
                type="button" 
                onClick={handleAddOption}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg"
               >
                 <Icon name="plus" size={14} />
                 اضافة خيار
               </button>
             </div>
             
             <div className="space-y-2">
               {options.map((opt, idx) => (
                 <div 
                   key={opt.id} 
                   className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors focus-within:bg-slate-50 focus-within:border-primary-200"
                 >
                   <div className="flex-1 w-full sm:w-auto">
                     <input
                        ref={(el) => { labelInputRefs.current[idx] = el }}
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                        placeholder="اسم الخيار"
                        className="w-full p-2 text-sm rounded-lg bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-primary-500 outline-none"
                        autoComplete="off"
                      />
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                       <div className="w-32">
                         <input
                            type="number"
                            value={opt.cost}
                            onChange={(e) => handleOptionChange(idx, 'cost', e.target.value)}
                            placeholder="السعر"
                            className="w-full p-2 text-sm rounded-lg bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-primary-500 outline-none"
                            autoComplete="off"
                          />
                       </div>
                       <div className="w-40">
                          <select
                            value={opt.costType || 'per_m2'}
                            onChange={(e) => handleOptionChange(idx, 'costType', e.target.value)}
                            className="w-full p-2 text-sm rounded-lg bg-slate-100 border border-slate-200 text-slate-800 focus:border-primary-500 outline-none h-[38px]"
                          >
                             <option value="per_m2">للمتر المربع</option>
                             <option value="fixed">سعر مقطوع</option>
                             <option value="percentage">نسبة (%)</option>
                          </select>
                       </div>
                       <button 
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={options.length <= 1}
                        tabIndex={-1}
                       >
                         <Icon name="trash" size={18} />
                       </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between gap-3 bg-slate-50 rounded-b-2xl">
          {category && onDelete ? (
             <button
              type="button"
              onClick={() => {
                if(window.confirm('هل أنت متأكد من حذف هذه المواصفة؟ سيتم فقدان جميع البيانات المتعلقة بها.')) {
                  onDelete(category.id);
                }
              }}
              className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-bold rounded-xl transition-colors flex items-center gap-2"
             >
               <Icon name="trash" size={18} />
               حذف المواصفة
             </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
            >
              الغاء
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};