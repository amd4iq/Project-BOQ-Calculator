import React from 'react';
import { Category } from '../types';
import { BASE_PRICE } from '../constants';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';
import { QualityIndicator } from './QualityIndicator';

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
            <div className="mb-6 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Card */}
                  <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group h-full">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col h-full justify-between">
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">السعر الإجمالي النهائي</span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tight">{formatCurrency(grandTotal)}</span>
                                <span className="text-sm font-medium text-emerald-400">IQD</span>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
                              <span>سعر المتر المربع الفعلي:</span>
                              <span className="text-white font-mono font-bold">{formatCurrency(Math.round(grandTotal / areaSize))}</span>
                          </div>
                      </div>
                  </div>

                  {/* Quality Indicator Integrated Here */}
                  <QualityIndicator categories={categories} selections={selections} />
                </div>
            </div>

            {/* SCREEN: List (Simplified) */}
            <div className="print:hidden space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">تفاصيل الاحتساب</h4>
                
                {/* Base Price Row */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-primary-600 flex items-center justify-center shadow-sm">
                             <Icon name="template" size={20} />
                         </div>
                         <div>
                             <p className="font-bold text-slate-800 text-sm">السعر الأساسي للهيكل</p>
                             <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                 {formatCurrency(BASE_PRICE)} × {areaSize} م²
                             </p>
                         </div>
                     </div>
                     <span className="font-black text-slate-700">{formatCurrency(baseTotal)}</span>
                </div>

                {/* Combined Additions Row */}
                {additionsTotal > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100 gap-2 sm:gap-0 transition-all hover:bg-emerald-100/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                                <Icon name="layers" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">مجموع الإضافات والمواصفات</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    قيمة جميع البنود الاختيارية المضافة
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pr-12 sm:pl-0">
                            <span className="font-black text-emerald-700 text-sm bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm">
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
      <div className="text-center print:hidden bg-amber-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-[10px] text-amber-800/70 font-bold flex items-center justify-center gap-2">
              <Icon name="zap" size={12} className="fill-amber-400 text-amber-500" />
              الأسعار الموضحة أعلاه هي أسعار تقديرية تخضع للتغيير بناءً على ظروف موقع العمل وتذبذب أسعار السوق العالمية للمواد.
          </p>
      </div>

    </div>
  );
};
