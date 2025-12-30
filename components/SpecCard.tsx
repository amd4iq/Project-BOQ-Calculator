
import React, { useState } from 'react';
import { Category, CategorySelection, ProjectDetails, QuoteType } from '../types';
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
  const [isSpaceCustomizing, setIsSpaceCustomizing] = useState(false);
  
  const currentSelection: CategorySelection = (typeof selection === 'object' && !Array.isArray(selection)) 
    ? selection 
    : { default: category.options[0]?.id, overrides: {} };

  const baselineOption = category.options[0];
  if (!baselineOption) return null;
  
  const baselineCost = baselineOption.cost;
  
  // Logic for Allocation Modes
  const isAllocated = projectDetails.enableSpaceDistribution;
  const mode = projectDetails.specAllocationMode || (isAllocated ? 'spaces' : 'percentage');
  const showCustomizationFeatures = quoteType === 'finishes' && isAllocated;
  const isPercentageMode = showCustomizationFeatures && mode === 'percentage';
  const isSpaceMode = showCustomizationFeatures && mode === 'spaces';

  const activeCustomSpaces = isSpaceMode
    ? (projectDetails.spaces || []).map(space => ({
        id: space.id,
        name: space.name,
      }))
    : [];

  const handleDefaultChange = (optionId: string) => {
    if (isReadOnly) return;
    
    // In percentage mode, switching default implies we need to remove the new default from 'percentages' map
    const newPercentages = { ...(currentSelection.percentages || {}) };
    delete newPercentages[optionId];
    
    onSelect(category.id, { 
        ...currentSelection, 
        default: optionId,
        percentages: newPercentages
    });
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

  const handlePercentageChange = (optionId: string, value: number) => {
      if (isReadOnly) return;
      let newPercentages = { ...(currentSelection.percentages || {}) };
      
      // Calculate total of ALL OTHER explicit options
      let otherTotal = 0;
      Object.entries(newPercentages).forEach(([key, val]) => {
          if (key !== optionId && key !== currentSelection.default) {
              otherTotal += val;
          }
      });

      // Constraint: Total explicit percentages cannot exceed 100
      const maxAllowed = 100 - otherTotal;
      let safeValue = Math.min(Math.max(0, value), maxAllowed);
      
      if (safeValue <= 0) {
          delete newPercentages[optionId];
      } else {
          newPercentages[optionId] = safeValue;
      }

      onSelect(category.id, { ...currentSelection, percentages: newPercentages });
  };

  const selectedOptionLabel = category.options.find(o => o.id === currentSelection.default)?.label || 'N/A';
  const hasOverrides = isSpaceMode && Object.keys(currentSelection.overrides).length > 0;
  
  // Calculate remaining percentage for default option
  const percentages = currentSelection.percentages || {};
  const cleanPercentages = { ...percentages };
  if (currentSelection.default in cleanPercentages) delete cleanPercentages[currentSelection.default];

  const usedPercentage = Object.values(cleanPercentages).reduce((sum, val) => sum + val, 0);
  const defaultPercentage = Math.max(0, 100 - usedPercentage);
  
  const isIncluded = (optId: string) => {
      if (currentSelection.default === optId) return defaultPercentage > 0;
      return (percentages[optId] || 0) > 0;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 ${isReadOnly ? 'opacity-70 bg-slate-50' : ''}`}>
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Icon name={category.iconName} size={18} /></div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{category.title}</h4>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isPercentageMode ? (
                  <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">توزيع بالنسب (%)</span>
              ) : isSpaceMode && hasOverrides ? (
                  <span className="text-amber-600 font-bold">مخصص حسب الفضاء</span>
              ) : (
                  selectedOptionLabel
              )}
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <button onClick={() => onEdit(category)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"><Icon name="pencil" size={14} /></button>
        )}
      </div>

      <div className="p-4 space-y-2 flex-1">
        
        {/* VIEW MODE: Standard OR Percentage Direct View */}
        {(!isSpaceCustomizing || !isSpaceMode) && (
          <div className="space-y-1.5">
            {category.options.map(opt => {
              const costDiff = opt.cost - baselineCost;
              const costType = opt.costType || 'per_m2';
              const costTypeLabel = costType === 'per_m2' ? '/ م2' : '';
              const isDefault = currentSelection.default === opt.id;
              
              // --- PERCENTAGE MODE ROW (COMPACT) ---
              if (isPercentageMode) {
                  const val = isDefault ? defaultPercentage : (percentages[opt.id] || 0);
                  const active = isIncluded(opt.id);
                  
                  return (
                    <div 
                        key={opt.id} 
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all gap-2
                            ${isDefault 
                                ? 'border-amber-400 bg-amber-50 shadow-sm' 
                                : active 
                                    ? 'border-amber-200 bg-white shadow-sm' 
                                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                            }
                        `}
                    >
                         {/* Selection & Label */}
                         <div className="flex items-center gap-2 flex-1 cursor-pointer min-w-0" onClick={() => handleDefaultChange(opt.id)}>
                            <div className={`
                                w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                                ${isDefault ? 'border-amber-600 bg-white' : 'border-slate-300'}
                            `}>
                                {isDefault && <div className="w-2 h-2 rounded-full bg-amber-600"></div>}
                            </div>
                            <div className="flex flex-col truncate">
                                <label className={`font-bold text-xs truncate ${isDefault ? 'text-amber-900' : 'text-slate-700'}`}>
                                    {opt.label}
                                </label>
                                <span className="text-[10px] font-mono text-slate-500">
                                    {formatCurrency(opt.cost)} IQD
                                </span>
                            </div>
                         </div>
                         
                         {/* Percentage Input / Display */}
                         <div className="flex items-center">
                             {isDefault ? (
                                 <div className="flex items-center gap-1.5 bg-amber-100/60 px-2 py-1 rounded border border-amber-200/60">
                                     <span className="text-[9px] text-amber-700 font-bold">المتبقي</span>
                                     <span className="text-xs font-black font-mono text-amber-800">{defaultPercentage}%</span>
                                 </div>
                             ) : (
                                 <div className={`relative group transition-all ${active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                     <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={val || ''}
                                        onChange={(e) => handlePercentageChange(opt.id, parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        disabled={isReadOnly}
                                        className={`
                                            w-[50px] pl-4 pr-1 py-1 rounded border text-center text-xs font-bold outline-none transition-all
                                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                            ${active 
                                                ? 'border-amber-300 bg-white text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-200' 
                                                : 'border-slate-200 bg-slate-100 text-slate-400 focus:bg-white focus:border-amber-300 focus:text-slate-800'
                                            }
                                        `}
                                     />
                                     <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold pointer-events-none ${active ? 'text-amber-600' : 'text-slate-400'}`}>%</span>
                                 </div>
                             )}
                         </div>
                    </div>
                  )
              }

              // --- STANDARD MODE ROW ---
              return (
                <div key={opt.id} onClick={() => handleDefaultChange(opt.id)} className={`flex justify-between items-center p-2.5 rounded-lg border transition-all ${currentSelection.default === opt.id ? 'border-primary-500 bg-primary-50' : `border-transparent bg-slate-50 ${!isReadOnly ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'}`}`}>
                  <label className={`font-bold text-xs text-slate-800 ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}>{opt.label}</label>
                  {costDiff === 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">ضمن السعر</span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-600">
                        +{formatCurrency(costDiff)}
                        <span className="text-[10px] text-slate-400"> {costTypeLabel}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* VIEW MODE 2: Space Customization List (Only for Space Mode) */}
        {isSpaceCustomizing && isSpaceMode && (
          <div className="space-y-2">
             <p className="text-[10px] text-slate-500 bg-amber-50 border border-amber-100 p-1.5 rounded-md">أنت في وضع التخصيص. سيتم تطبيق المواصفات التالية على الفضاءات المحددة فقط.</p>
            {activeCustomSpaces.length > 0 ? activeCustomSpaces.map(space => (
                <div key={space.id} className="flex items-center justify-between gap-2 p-1.5 bg-slate-50/70 rounded-md">
                    <label className="text-xs font-bold text-slate-700 truncate flex-1">{space.name}</label>
                    <select
                        value={currentSelection.overrides[space.id] || currentSelection.default}
                        onChange={(e) => handleOverrideChange(space.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold w-32 disabled:bg-slate-100 disabled:text-slate-500"
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
      
      {/* Footer / Toggle Button for Space Mode ONLY */}
      {isSpaceMode && !isReadOnly && (
          <div className="p-3 bg-slate-50/50 border-t border-slate-100">
            <button onClick={() => setIsSpaceCustomizing(!isSpaceCustomizing)} className="w-full text-xs font-bold text-center p-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors bg-white hover:bg-slate-100 border border-slate-200 text-slate-600">
                <Icon name={isSpaceCustomizing ? 'settings' : 'sofa'} size={12} />
                {isSpaceCustomizing ? 'العودة للاختيار العام' : 'تخصيص حسب الفضاء'}
            </button>
          </div>
      )}
    </div>
  );
};
