
import React, { useState } from 'react';
import { Category, CategorySelection, ProjectDetails, SelectionState, Space, QuoteType } from '../types';
import { Icon } from './Icons';
import { formatCurrency } from '../utils/format';

interface SpecCardProps {
  category: Category;
  selection: CategorySelection | string[];
  onSelect: (categoryId: string, newSelection: CategorySelection) => void;
  onEdit: (category: Category) => void;
  projectDetails: ProjectDetails;
  quoteType: QuoteType;
}

export const SpecCard: React.FC<SpecCardProps> = ({ 
  category, 
  selection, 
  onSelect, 
  onEdit, 
  projectDetails,
  quoteType
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const currentSelection: CategorySelection = (typeof selection === 'object' && !Array.isArray(selection)) 
    ? selection 
    : { default: category.options[0]?.id, overrides: {} };

  const spaces = projectDetails.spaces || [];
  const baselineOption = category.options[0];
  if (!baselineOption) return null;
  
  const baselineCost = baselineOption.cost;
  const showCustomization = quoteType === 'finishes';

  const handleDefaultChange = (optionId: string) => {
    onSelect(category.id, { ...currentSelection, default: optionId });
  };
  
  const handleOverrideChange = (spaceId: string, optionId: string) => {
    const newOverrides = { ...currentSelection.overrides };
    if (optionId === currentSelection.default) {
      delete newOverrides[spaceId];
    } else {
      newOverrides[spaceId] = optionId;
    }
    onSelect(category.id, { ...currentSelection, overrides: newOverrides });
  };

  const selectedOptionLabel = category.options.find(o => o.id === currentSelection.default)?.label || 'N/A';
  const hasOverrides = showCustomization && Object.keys(currentSelection.overrides).length > 0;
  
  const totalWeight = spaces.reduce((acc, space) => acc + (space.weight || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Icon name={category.iconName} size={20} /></div>
          <div>
            <h4 className="font-bold text-slate-800">{category.title}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {hasOverrides && isWeightValid ? <span className="text-amber-600 font-bold">مخصص حسب الفضاء</span> : selectedOptionLabel}
            </p>
          </div>
        </div>
        <button onClick={() => onEdit(category)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"><Icon name="pencil" size={14} /></button>
      </div>

      <div className="p-5 space-y-3 flex-1">
        {(!isCustomizing || !showCustomization) ? (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">الاختيار العام (لكامل المشروع)</label>
            {category.options.map(opt => {
              const costDiff = opt.cost - baselineCost;
              return (
                <div key={opt.id} onClick={() => handleDefaultChange(opt.id)} className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${currentSelection.default === opt.id ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                  <label className="font-bold text-sm text-slate-800">{opt.label}</label>
                  {costDiff === 0 ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">ضمن السعر</span>
                  ) : (
                    <span className="text-sm font-mono font-bold text-slate-600">
                        +{formatCurrency(costDiff)}
                        <span className="text-xs text-slate-400"> /م²</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
             <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2 rounded-lg">أنت في وضع التخصيص. سيتم حساب التكلفة بناءً على الوزن النسبي لكل فضاء.</p>
            {(spaces.length > 0 && isWeightValid) ? spaces.map(space => (
                <div key={space.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-md">
                    <label className="text-sm font-bold text-slate-700 truncate flex-1">{space.name} <span className="text-xs font-normal text-slate-400">({space.weight}%)</span></label>
                    <select
                        value={currentSelection.overrides[space.id] || currentSelection.default}
                        onChange={(e) => handleOverrideChange(space.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold w-40"
                    >
                        {category.options.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                        <option disabled>──────────</option>
                        <option value="__EXCLUDE__">استثناء (لا ينطبق)</option>
                    </select>
                </div>
            )) : <p className="text-xs text-center text-rose-500 p-4 bg-rose-50 rounded-lg border border-rose-100">يرجى إضافة فضاءات والتأكد من أن مجموع أوزانها 100% لتتمكن من التخصيص.</p>}
          </div>
        )}
      </div>
      
      {showCustomization && (
          <div className="p-3 bg-slate-50/50 border-t border-slate-100">
            <button onClick={() => setIsCustomizing(!isCustomizing)} className="w-full text-xs font-bold text-center p-2 rounded-lg flex items-center justify-center gap-2 transition-colors bg-white hover:bg-slate-100 border border-slate-200 text-slate-600">
                <Icon name={isCustomizing ? 'settings' : 'sofa'} size={14} />
                {isCustomizing ? 'العودة للاختيار العام' : 'تخصيص حسب الفضاء'}
            </button>
          </div>
      )}
    </div>
  );
};
