import React from 'react';
import { Category } from '../types';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';

interface OptionSelectorProps {
  category: Category;
  selectedOptionId: string | string[];
  onSelect: (categoryId: string, optionId: string) => void;
  onEdit: (category: Category) => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ category, selectedOptionId, onSelect, onEdit }) => {
  const isMulti = category.allowMultiple;
  const selectedIds = Array.isArray(selectedOptionId) ? selectedOptionId : [selectedOptionId];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 break-inside-avoid h-full flex flex-col group/card relative overflow-hidden print:border-none print:shadow-none print:p-0 print:mb-4">
      
      {/* Edit Button (Top Left) */}
      <div className="absolute top-3 left-3 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 print:hidden">
         <button 
          onClick={(e) => { e.stopPropagation(); onEdit(category); }}
          className="p-1.5 bg-white text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          title="تعديل الخيارات"
        >
          <Icon name="pencil" size={14} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 print:mb-2">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-100 text-slate-600 shadow-inner shrink-0 print:hidden">
          <Icon name={category.iconName} size={24} />
        </div>
        <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-base font-black text-slate-800 leading-tight print:text-black print:text-lg">
                {category.title}
            </h3>
            {isMulti && (
                <div className="flex items-center gap-1 mt-1 print:hidden">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100 inline-flex items-center gap-1">
                        <Icon name="layers" size={10} />
                        اختيار متعدد
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2 flex-1">
        {category.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const hasCost = option.cost > 0;
          
          let costDisplay = '';
          if (hasCost) {
             if (option.costType === 'percentage') {
                 costDisplay = `+${option.cost}%`;
             } else {
                 costDisplay = `+${formatCurrency(option.cost)}`;
             }
          } else {
              costDisplay = 'ضمن السعر';
          }

          return (
            <button
              key={option.id}
              onClick={() => onSelect(category.id, option.id)}
              className={`
                w-full relative flex items-center p-3 rounded-xl border transition-all duration-200 group text-right
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50/60 shadow-sm ring-1 ring-primary-500/20 z-10' 
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                }
                print:border-0 print:bg-transparent print:p-1 print:block
              `}
            >
              {/* Radio/Checkbox Icon */}
              <div className={`ml-3 flex-shrink-0 transition-all duration-300 ${isSelected ? 'text-primary-600 scale-110' : 'text-slate-300 group-hover:text-slate-400'} print:inline-block print:ml-2 print:align-middle`}>
                  {isMulti ? (
                      isSelected ? <Icon name="check-square" size={20} /> : <Icon name="square" size={20} />
                  ) : (
                      isSelected ? <Icon name="check" size={20} className="stroke-[3px]" /> : <Icon name="circle" size={20} />
                  )}
              </div>

              {/* Text & Price Container */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 print:inline-block print:align-middle">
                
                {/* Label */}
                <span className={`font-bold text-sm transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'} print:text-black`}>
                  {option.label}
                </span>
                
                {/* Price Badge */}
                <span className={`
                    text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap self-start sm:self-auto transition-colors
                    ${hasCost 
                        ? (isSelected ? 'bg-white text-emerald-700 border border-emerald-100 shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200') 
                        : (isSelected ? 'bg-primary-100 text-primary-700' : 'bg-slate-50 text-slate-400')
                    }
                    print:hidden
                `}>
                  {costDisplay}
                </span>

                {/* Print Only Price */}
                <span className="hidden print:inline-block text-xs text-slate-500 mr-2">
                    {hasCost ? `(${costDisplay})` : ''}
                </span>

              </div>
              
              {/* Selected Indicator Bar (Left Side) */}
              {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary-500 rounded-r-full print:hidden"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};