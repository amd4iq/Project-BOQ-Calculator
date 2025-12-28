import React from 'react';
import { Category, SelectionState } from '../types';
import { BASE_PRICE, BASE_ACTUAL_COST } from '../constants';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';

interface ProfitabilityPanelProps {
  categories: Category[];
  selections: SelectionState;
  areaSize: number;
}

export const ProfitabilityPanel: React.FC<ProfitabilityPanelProps> = ({ categories, selections, areaSize }) => {
  // Calculation logic
  let totalPrice = BASE_PRICE * areaSize;
  let totalCost = BASE_ACTUAL_COST * areaSize;

  categories.forEach(cat => {
    const selection = selections[cat.id];
    const selectedIds = Array.isArray(selection) ? selection : (selection ? [selection] : []);

    selectedIds.forEach(id => {
      const opt = cat.options.find(o => o.id === id);
      if (opt) {
        const type = opt.costType || 'per_m2';
        const costVal = opt.actualCost || (opt.cost * 0.75); // Fallback estimate

        if (type === 'per_m2') {
          totalPrice += opt.cost * areaSize;
          totalCost += costVal * areaSize;
        } else if (type === 'fixed') {
          totalPrice += opt.cost;
          totalCost += costVal;
        } else if (type === 'percentage') {
          // Simplified percentage based on current base price
          const subtotalPrice = BASE_PRICE * areaSize;
          totalPrice += subtotalPrice * (opt.cost / 100);
          totalCost += (BASE_ACTUAL_COST * areaSize) * (opt.cost / 100);
        }
      }
    });
  });

  const profit = totalPrice - totalCost;
  const margin = (profit / totalPrice) * 100;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-600 p-2 rounded-xl">
          <Icon name="pie-chart" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">تحليل الربحية للمقاول</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">سري - لا يظهر في العرض النهائي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <span className="block text-[10px] text-slate-500 font-bold mb-1">إجمالي الإيرادات</span>
          <span className="block text-xl font-black font-mono">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <span className="block text-[10px] text-slate-500 font-bold mb-1">إجمالي التكلفة التقديرية</span>
          <span className="block text-xl font-black font-mono text-rose-400">{formatCurrency(totalCost)}</span>
        </div>
        <div className="p-4 bg-primary-600/20 rounded-2xl border border-primary-500/30">
          <span className="block text-[10px] text-primary-400 font-bold mb-1">صافي الربح</span>
          <span className="block text-xl font-black font-mono text-emerald-400">{formatCurrency(profit)}</span>
        </div>
        <div className="p-4 bg-emerald-600/20 rounded-2xl border border-emerald-500/30">
          <span className="block text-[10px] text-emerald-400 font-bold mb-1">هامش الربح (%)</span>
          <span className="block text-2xl font-black font-mono text-emerald-400">{margin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};