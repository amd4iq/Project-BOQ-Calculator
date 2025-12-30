
import React, { useState } from 'react';
import { Category, ProjectDetails, QuoteType, SelectionState, CategorySelection } from '../types';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';
import { QualityIndicator } from './ConstructionOffers/QualityIndicator';

interface PriceBreakdownProps {
  categories: Category[];
  selections: SelectionState;
  projectDetails: ProjectDetails;
  showIndividualPrices: boolean;
  quoteTotals: {
    grandTotal: number;
    effectiveBasePrice: number;
    isSpecialConditionApplied: boolean;
    specialConditionReasons: string[];
    baseTotal: number;
    finalPricePerM2: number;
  },
  quoteType: QuoteType;
  onBasePriceChange: (newPrice: number) => void;
  isReadOnly: boolean;
}

const BudgetTracker: React.FC<{ details: ProjectDetails, total: number }> = ({ details, total }) => {
  if (!details.enableBudgeting || !details.targetBudget || details.targetBudget <= 0) {
    return null;
  }

  const { targetBudget } = details;
  const percentage = (total / targetBudget) * 100;
  const remaining = targetBudget - total;

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  if (percentage > 90) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }
  if (percentage > 100) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700';
  }

  return (
    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="font-bold text-slate-500 flex items-center gap-1.5">
          <Icon name="pie-chart" size={14} />
          متابعة الميزانية
        </span>
        <span className="font-bold text-slate-700 font-mono">{formatCurrency(total)} / <span className="text-slate-500">{formatCurrency(targetBudget)}</span></span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}>
        </div>
        {percentage > 100 && (
            <div 
                className="absolute inset-0 h-full rounded-full bg-rose-500/30" 
                style={{ width: `${Math.min(percentage, 200) - 100}%`, left: '100%' }}>
            </div>
        )}
      </div>
      <p className={`text-xs text-center font-bold mt-2 ${textColor}`}>
        {remaining >= 0 ? 
          `المتبقي: ${formatCurrency(remaining)}` :
          `تجاوز الميزانية: ${formatCurrency(Math.abs(remaining))}`
        }
      </p>
    </div>
  );
}


export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ 
  categories, 
  selections, 
  projectDetails,
  showIndividualPrices,
  quoteTotals,
  quoteType,
  onBasePriceChange,
  isReadOnly
}) => {
  const [isEditingBase, setIsEditingBase] = useState(false);
  
  const { areaSize } = projectDetails;
  const { grandTotal, effectiveBasePrice, isSpecialConditionApplied, baseTotal, finalPricePerM2 } = quoteTotals;
  const [tempBasePrice, setTempBasePrice] = useState(effectiveBasePrice);

  const additionsTotal = grandTotal - baseTotal;
  const isStructure = quoteType === 'structure';

  const handleSaveBasePrice = () => {
    onBasePriceChange(Number(tempBasePrice));
    setIsEditingBase(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveBasePrice();
    if (e.key === 'Escape') setIsEditingBase(false);
  };

  const detailedItems: any[] = [];
  let fixedCostTotal = 0;

  categories.forEach(cat => {
      const selection = selections[cat.id];
      const selectedIds = Array.isArray(selection) 
        ? selection 
        : (selection ? [(selection as CategorySelection).default] : []);

      selectedIds.forEach(id => {
          const selectedOption = cat.options.find(o => o.id === id);
          if(selectedOption && selectedOption.cost > 0) {
            const type = selectedOption.costType || (isStructure ? 'per_m2' : 'fixed');
            let calculatedCost = 0;
            let calcText = '';

            if(type === 'per_m2') {
                calculatedCost = selectedOption.cost * areaSize;
                calcText = `${formatCurrency(selectedOption.cost)} × ${areaSize} م²`;
            } else if (type === 'fixed') {
                calculatedCost = selectedOption.cost;
                if (cat.id === 'fixed_additions') {
                    fixedCostTotal += calculatedCost;
                }
                calcText = 'سعر مقطوع';
            }

            if (type !== 'percentage' && cat.id !== 'fixed_additions') {
                detailedItems.push({
                    id: `${cat.id}-${id}`,
                    categoryTitle: cat.title,
                    optionLabel: selectedOption.label,
                    totalPrice: calculatedCost,
                    calculationText: calcText
                });
            }
          }
      });
  });
  
  const BasePriceComponent = () => (
    <div className="flex justify-between items-start group">
      <div>
        <p className="font-bold text-slate-700 flex items-center gap-2">
          {isStructure ? 'التكلفة الأساسية للهيكل' : 'التكلفة الأساسية للإنهاءات'}
          {!isEditingBase && !isReadOnly && (
              <button 
                  onClick={() => { setIsEditingBase(true); setTempBasePrice(effectiveBasePrice); }}
                  className="p-1 text-slate-400 hover:text-primary-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="تعديل السعر الأساسي للمتر"
              >
                  <Icon name="pencil" size={14}/>
              </button>
          )}
        </p>
        {isEditingBase ? (
            <div className="flex items-center gap-1.5 mt-1">
                <input 
                    type="number"
                    value={tempBasePrice}
                    onChange={(e) => setTempBasePrice(Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                    className="w-32 bg-white border border-primary-300 rounded-lg px-2 py-1 text-sm font-bold text-primary-700 focus:outline-none focus:ring-2 ring-primary-200 transition-all"
                    autoFocus
                />
                 <button onClick={handleSaveBasePrice} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="حفظ"><Icon name="check-simple" size={16} /></button>
                 <button onClick={() => setIsEditingBase(false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors" title="إلغاء"><Icon name="x" size={16} /></button>
            </div>
        ) : (
            <p className="text-xs text-slate-500 font-mono mt-0.5">
                ({formatCurrency(effectiveBasePrice)}/م² × {areaSize} م²)
            </p>
        )}
      </div>
      <span className="font-bold text-slate-800 text-lg">{formatCurrency(baseTotal)}</span>
    </div>
  );

  const AdditionsComponent = () => (
     <div className="space-y-3">
        <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-700">مجموع تكلفة الإضافات</p>
                <p className="text-xs text-slate-500 mt-0.5">
                    يشمل جميع البنود الإضافية المختارة
                </p>
            </div>
            <span className="font-bold text-slate-800 text-lg">{formatCurrency(additionsTotal)}</span>
        </div>
        {finalPricePerM2 > effectiveBasePrice && (
            <div className="flex justify-between items-center text-right pr-4 border-r-2 border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-600 text-xs">سعر المتر المربع المحدث</p>
                </div>
                <span className="font-bold text-primary-600 text-sm">{formatCurrency(finalPricePerM2)}/م²</span>
            </div>
        )}
    </div>
  );


  return (
    <div className="space-y-6 avoid-break print:space-y-2">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
                <Icon name="calculator" size={18} className="text-primary-600" />
                <h3 className="font-bold text-slate-800">تفاصيل السعر</h3>
            </div>
        </div>

        <div className="hidden print:block">
            <h3 className="print-title-bar">الخلاصة المالية النهائية</h3>
        </div>
        
        <div className="p-6 print:p-0">
            <div className="print:hidden space-y-6">
                <BudgetTracker details={projectDetails} total={grandTotal} />

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4">
                    <BasePriceComponent />
                    <div className="border-t border-slate-200 border-dashed my-2"></div>
                    <AdditionsComponent />
                </div>

                <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-300">
                    <div className="flex justify-between items-center">
                         <div>
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">السعر الإجمالي النهائي</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-4xl font-black">{formatCurrency(grandTotal)}</span>
                                <span className="text-lg font-medium text-emerald-400">IQD</span>
                            </div>
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-xl">
                            <Icon name="package" size={28} />
                        </div>
                    </div>
                </div>
                
                <QualityIndicator categories={categories} selections={selections} quoteType={quoteType} />
            </div>

            <table className="hidden print:table print-table w-full">
                <thead>
                    <tr>
                        <th className="w-3/5">البيان / الفقرة الفنية</th>
                        <th className="w-1/5 text-center">المعادلة</th>
                        <th className="w-1/5 text-left">الإجمالي (IQD)</th>
                    </tr>
                </thead>
                <tbody>
                    {isStructure ? (
                      <>
                        <tr>
                            <td className="font-bold">سعر المتر المربع</td>
                            <td className="text-center font-mono text-[8pt] text-slate-400">
                                {isSpecialConditionApplied ? 'السعر المعدل' : 'السعر الأساسي'}
                            </td>
                            <td className="font-bold text-left">{formatCurrency(effectiveBasePrice)}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">الهيكل الأساسي للمشروع</td>
                            <td className="text-center font-mono text-[8pt] text-slate-400">{formatCurrency(effectiveBasePrice)} × {areaSize} م²</td>
                            <td className="font-bold text-left">{formatCurrency(baseTotal)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                          <td className="font-bold">التكلفة الأساسية للإنهاءات</td>
                          <td className="text-center font-mono text-[8pt] text-slate-400">{formatCurrency(effectiveBasePrice)} × {areaSize} م²</td>
                          <td className="font-bold text-left">{formatCurrency(baseTotal)}</td>
                      </tr>
                    )}
                    {showIndividualPrices && detailedItems.map((item) => (
                        <tr key={item.id}>
                            <td className="text-slate-700">
                                {item.categoryTitle}: <span className="font-bold text-black">{item.optionLabel}</span>
                            </td>
                            <td className="text-center font-mono text-[8pt] text-slate-400">{item.calculationText}</td>
                            <td className="font-bold text-left">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                    ))}
                    {showIndividualPrices && fixedCostTotal > 0 && (
                        <tr>
                            <td className="font-bold">مجموع الإضافات المقطوعة</td>
                            <td className="text-center font-mono text-[8pt] text-slate-400">إجمالي</td>
                            <td className="font-bold text-left">{formatCurrency(fixedCostTotal)}</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="print-total-row">
                        <td colSpan={2} className="font-black text-right py-1.5 uppercase tracking-tight text-[9pt]">إجمالي قيمة العقد النهائية</td>
                        <td className="font-black text-[9pt] text-left py-1.5">{formatCurrency(grandTotal)} <span className="text-[7pt] font-normal">IQD</span></td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>
    </div>
  );
};
