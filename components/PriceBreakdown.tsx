import React from 'react';
import { Category } from '../types';
import { BASE_PRICE } from '../constants';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';

interface PriceBreakdownProps {
  categories: Category[];
  selections: Record<string, string | string[]>;
  areaSize: number;
  showIndividualPrices: boolean;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ 
  categories, 
  selections, 
  areaSize,
  showIndividualPrices
}) => {
  
  // -- Calculation Logic --
  const baseTotal = BASE_PRICE * areaSize;
  let addedPerM2Total = 0;
  let fixedCostTotal = 0;
  let percentageTotal = 0;

  // Prepared data structure for rendering
  const detailedItems: {
    id: string;
    categoryTitle: string;
    optionLabel: string;
    unitPrice: number;
    totalPrice: number;
    calculationText: string;
    type: 'per_m2' | 'fixed' | 'percentage';
    icon: string;
    color: string;
  }[] = [];

  // Pass 1: Calculate fixed and per_m2 costs
  categories.forEach(cat => {
      const selection = selections[cat.id];
      const selectedIds = Array.isArray(selection) ? selection : (selection ? [selection] : []);

      selectedIds.forEach(id => {
          const selectedOption = cat.options.find(o => o.id === id);
          if(selectedOption && selectedOption.cost > 0) {
            const type = selectedOption.costType || 'per_m2';
            let calculatedCost = 0;
            let calcText = '';

            if(type === 'per_m2') {
                calculatedCost = selectedOption.cost * areaSize;
                addedPerM2Total += calculatedCost;
                calcText = `${formatCurrency(selectedOption.cost)} × ${areaSize} م²`;
            } else if (type === 'fixed') {
                calculatedCost = selectedOption.cost;
                fixedCostTotal += calculatedCost;
                calcText = 'سعر مقطوع (Fixed)';
            }

            if (type !== 'percentage') {
                detailedItems.push({
                    id: `${cat.id}-${id}`,
                    categoryTitle: cat.title,
                    optionLabel: selectedOption.label,
                    unitPrice: selectedOption.cost,
                    totalPrice: calculatedCost,
                    calculationText: calcText,
                    type: type,
                    icon: cat.iconName,
                    color: type === 'fixed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                });
            }
          }
      });
  });

  const subtotal = baseTotal + addedPerM2Total + fixedCostTotal;

  // Pass 2: Calculate percentage costs (based on subtotal)
  categories.forEach(cat => {
      const selection = selections[cat.id];
      const selectedIds = Array.isArray(selection) ? selection : (selection ? [selection] : []);

      selectedIds.forEach(id => {
          const selectedOption = cat.options.find(o => o.id === id);
          if(selectedOption && selectedOption.cost > 0 && selectedOption.costType === 'percentage') {
              const val = subtotal * (selectedOption.cost / 100);
              percentageTotal += val;
              
              detailedItems.push({
                    id: `${cat.id}-${id}`,
                    categoryTitle: cat.title,
                    optionLabel: selectedOption.label,
                    unitPrice: selectedOption.cost,
                    totalPrice: val,
                    calculationText: `${selectedOption.cost}% من المجموع الأولي`,
                    type: 'percentage',
                    icon: cat.iconName,
                    color: 'bg-violet-100 text-violet-700'
              });
          }
      });
  });

  const grandTotal = subtotal + percentageTotal;
  const additionsTotal = addedPerM2Total + fixedCostTotal + percentageTotal;

  return (
    <div className="space-y-6">
      
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg shadow-sm text-primary-600">
                    <Icon name="calculator" size={18} />
                </div>
                <h3 className="font-bold text-slate-800">تفاصيل السعر والكميات</h3>
            </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block bg-slate-100 border border-black p-2 mb-0 font-bold text-black text-center border-b-0">
            الخلاصة المالية وتفاصيل الأسعار
        </div>
        
        <div className="p-6 print:p-0">
            
            {/* SCREEN ONLY: Summary Cards */}
            <div className="mb-8 print:hidden">
                {/* Total Card - Made Lighter (slate-700 instead of slate-900) */}
                <div className="bg-slate-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                     <div className="relative z-10">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">السعر الإجمالي النهائي</span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tight">{formatCurrency(grandTotal)}</span>
                            <span className="text-sm font-medium text-emerald-400">IQD</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between items-center text-xs text-slate-300">
                             <span>سعر المتر المربع الفعلي:</span>
                             <span className="text-white font-mono font-bold">{formatCurrency(grandTotal / areaSize)}</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* SCREEN: List (Simplified) */}
            <div className="print:hidden space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">تفاصيل الاحتساب</h4>
                
                {/* Base Price Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                             <span className="font-bold font-serif text-lg">A</span>
                         </div>
                         <div>
                             <p className="font-bold text-slate-800 text-sm">السعر الأساسي للمتر</p>
                             <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                 {formatCurrency(BASE_PRICE)} × {areaSize} م²
                             </p>
                         </div>
                     </div>
                     <span className="font-bold text-slate-700">{formatCurrency(baseTotal)}</span>
                </div>

                {/* Combined Additions Row (Replacing Detailed List) */}
                {additionsTotal > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Icon name="layers" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">مجموع الإضافات والمواصفات</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    قيمة جميع الفقرات الإضافية المختارة
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pl-12 sm:pl-0">
                            <span className="font-bold text-emerald-700 text-sm bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                + {formatCurrency(additionsTotal)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT VIEW: Strict Table (Keeps Details for Contract) */}
            <table className="hidden print:table print-table w-full text-sm">
                <thead>
                    <tr>
                        <th className="w-1/2">البيان / التفاصيل</th>
                        <th className="w-1/4 text-center">طريقة الاحتساب</th>
                        <th className="w-1/4 text-left">السعر الكلي</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Base Price */}
                    <tr>
                        <td>
                            <span className="font-bold block">الهيكل الأساسي (Base Structure)</span>
                            <span className="text-xs">حسب المساحة المثبتة</span>
                        </td>
                        <td className="text-center text-xs font-mono">
                            {formatCurrency(BASE_PRICE)} × {areaSize}
                        </td>
                        <td className="font-bold text-left">{formatCurrency(baseTotal)}</td>
                    </tr>
                    
                    {/* Dynamic Items */}
                    {detailedItems.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <span className="font-bold block">{item.categoryTitle}</span>
                                <span className="text-xs text-slate-600">{item.optionLabel}</span>
                            </td>
                            <td className="text-center text-xs font-mono">
                                {item.calculationText}
                            </td>
                            <td className="font-bold text-left">
                                {formatCurrency(item.totalPrice)}
                            </td>
                        </tr>
                    ))}

                    {/* Totals */}
                    <tr>
                        <td colSpan={2} className="font-bold bg-slate-100 border-t-2 border-black text-right pr-4">المجموع الكلي النهائي</td>
                        <td className="font-black text-lg bg-slate-100 border-t-2 border-black text-left">{formatCurrency(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

        </div>
      </div>
      
      {/* Footer Disclaimer */}
      <div className="text-center print:hidden bg-amber-50 p-3 rounded-lg border border-amber-100">
          <p className="text-[10px] text-amber-800/70 font-bold flex items-center justify-center gap-1">
              <Icon name="zap" size={12} />
              الأسعار أعلاه تقديرية وقد تختلف قليلاً بناءً على موقع العمل وتغيرات السوق
          </p>
      </div>

    </div>
  );
};