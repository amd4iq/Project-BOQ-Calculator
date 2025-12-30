
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
    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bar-chart" size={16} className="text-primary-600" />
        تفاصيل حساب الذرعة
      </h4>
      <p className="text-[10px] text-slate-500 mt-1 pr-1">
        توزيع المساحة الإجمالية بناءً على البنود المدخلة.
      </p>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
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
            <div key={row.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-primary-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-xs text-slate-800 leading-tight pr-0.5 truncate w-full" title={row.label || "بند غير مسمى"}>{row.label || "بند غير مسمى"}</p>
                    <p className="text-[10px] text-slate-500 font-semibold whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0 ml-1">{calculationText}</p>
                </div>
                
                <div className="flex items-end justify-between mt-auto">
                   <div>
                       <div className="flex items-baseline gap-1">
                             <span className="text-lg font-black text-slate-700 font-mono">{rowArea.toFixed(1)}</span>
                             <span className="text-[10px] font-bold text-slate-400">م²</span>
                       </div>
                   </div>
                   <div className="text-right">
                        <span className="text-sm font-black text-primary-700 font-mono leading-none">{percentage.toFixed(0)}<small className="text-[10px] font-bold">%</small></span>
                   </div>
                </div>
                
                <div className="mt-2">
                     <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
