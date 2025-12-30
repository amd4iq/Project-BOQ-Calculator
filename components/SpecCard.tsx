
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
  isReadOnly: boolean;
}

export const SpecCard: React.FC<SpecCardProps> = ({ 
  category, 
  selection, 
  onSelect, 
  onEdit, 
  projectDetails,
  quoteType,
  isReadOnly
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const currentSelection: CategorySelection = (typeof selection === 'object' && !Array.isArray(selection)) 
    ? selection 
    : { default: category.options[0]?.id, overrides: {} };

  const baselineOption = category.options[0];
  if (!baselineOption) return null;
  
  const baselineCost = baselineOption.cost;
  const showCustomization = quoteType === 'finishes';

  const activeCustomSpaces = showCustomization
    ? (projectDetails.spaces || []).map(space => ({
        id: space.id,
        name: space.name,
      }))
    : [];

  const handleDefaultChange = (optionId: string) => {
    if (isReadOnly) return;
    onSelect(category.id, { ...currentSelection, default: optionId });
  };
  
  const handleOverrideChange = (spaceId: string, optionId: string) => {
    if (isReadOnly) return;
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

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 ${isReadOnly ? 'opacity-70 bg-slate-50' : ''}`}>
      <div className="p-5 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Icon name={category.iconName} size={20} /></div>
          <div>
            <h4 className="font-bold text-slate-800">{category.title}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {hasOverrides ? <span className="text-amber-600 font-bold">مخصص حسب الفضاء</span> : selectedOptionLabel}
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <button onClick={() => onEdit(category)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"><Icon name="pencil" size={14} /></button>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1">
        {(!isCustomizing || !showCustomization) ? (
          <div className="space-y-2">
            {category.options.map(opt => {
              const costDiff = opt.cost - baselineCost;
              const costType = opt.costType || 'per_m2';
              const costTypeLabel = costType === 'per_m2' ? '/ م2' : '';

              return (
                <div key={opt.id} onClick={() => handleDefaultChange(opt.id)} className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all ${currentSelection.default === opt.id ? 'border-primary-500 bg-primary-50' : `border-transparent bg-slate-50 ${!isReadOnly ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'}`}`}>
                  <label className={`font-bold text-sm text-slate-800 ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}>{opt.label}</label>
                  {costDiff === 0 ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">ضمن السعر</span>
                  ) : (
                    <span className="text-sm font-mono font-bold text-slate-600">
                        +{formatCurrency(costDiff)}
                        <span className="text-xs text-slate-400"> {costTypeLabel}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
             <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2 rounded-lg">أنت في وضع التخصيص. سيتم تطبيق المواصفات التالية على الفضاءات المحددة فقط.</p>
            {activeCustomSpaces.length > 0 ? activeCustomSpaces.map(space => (
                <div key={space.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-md">
                    <label className="text-sm font-bold text-slate-700 truncate flex-1">{space.name}</label>
                    <select
                        value={currentSelection.overrides[space.id] || currentSelection.default}
                        onChange={(e) => handleOverrideChange(space.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold w-40 disabled:bg-slate-100 disabled:text-slate-500"
                        disabled={isReadOnly}
                    >
                        {category.options.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                        <option disabled>──────────</option>
                        <option value="__EXCLUDE__">استثناء (لا ينطبق)</option>
                    </select>
                </div>
            )) : <p className="text-xs text-center text-rose-500 p-4 bg-rose-50 rounded-lg border border-rose-100">يرجى تعريف الفضاءات وتوزيع المساحات من قسم "بيانات المشروع" أولاً.</p>}
          </div>
        )}
      </div>
      
      {showCustomization && !isReadOnly && (
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
