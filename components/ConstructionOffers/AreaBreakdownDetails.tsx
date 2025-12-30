import React from 'react';
import { AreaRow } from '../../types';
import { Icon } from '../Icons';

const calculateRowArea = (row: AreaRow): number => {
  if (!row.dim1) return 0;
  switch (row.shape) {
    case 'full': return row.dim1;
    case 'half': return row.dim1 / 2;
    case 'third': return row.dim1 / 3;
    default: return 0;
  }
};

export const AreaBreakdownDetails: React.FC<{ breakdown: AreaRow[], totalArea: number }> = ({ breakdown, totalArea }) => {
  return (
    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
      <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bar-chart" size={18} className="text-primary-600" />
        تفاصيل حساب الذرعة
      </h4>
      <p className="text-xs text-slate-500 mt-1 pr-1">
        مرجع لكيفية احتساب المساحة الإجمالية للبناء بناءً على البنود المدخلة وقواعد الذرعة المعتمدة.
      </p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {breakdown.filter(row => row.dim1 > 0).map(row => {
          const rowArea = calculateRowArea(row);
          const percentage = totalArea > 0 ? (rowArea / totalArea) * 100 : 0;

          let calculationText = '';
          switch (row.shape) {
            case 'full': calculationText = `كاملة`; break;
            case 'half': calculationText = `نصف`; break;
            case 'third': calculationText = `ثلث`; break;
          }

          return (
            <div key={row.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-primary-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-base text-slate-800 leading-tight pr-1">{row.label || "بند غير مسمى"}</p>
                    <p className="text-xs text-slate-500 font-semibold whitespace-nowrap bg-slate-100 px-2 py-1 rounded-lg">{calculationText}</p>
                </div>
                
                <div className="flex items-end justify-between mt-4">
                   <div>
                       <p className="text-xs text-slate-400 font-medium">المساحة</p>
                       <div className="flex items-baseline gap-1.5">
                             <span className="text-2xl font-black text-slate-700 font-mono">{rowArea.toFixed(1)}</span>
                             <span className="text-sm font-bold text-slate-400">م²</span>
                       </div>
                   </div>
                   <div className="text-right">
                        <p className="text-xs text-primary-700/80 font-medium">النسبة</p>
                        <span className="text-3xl font-black text-primary-700 font-mono leading-none">{percentage.toFixed(1)}<small className="text-lg font-bold">%</small></span>
                   </div>
                </div>
                
                <div className="mt-4">
                     <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                         <div className="bg-primary-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                     </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};