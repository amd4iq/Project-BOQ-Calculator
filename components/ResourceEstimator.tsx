import React from 'react';
import { RESOURCE_ESTIMATES } from '../constants';
import { Icon } from './Icons';

interface ResourceEstimatorProps {
  areaSize: number;
}

export const ResourceEstimator: React.FC<ResourceEstimatorProps> = ({ areaSize }) => {
  // Simple estimation logic
  const estimates = [
      { name: 'اسمنت', value: Math.ceil(areaSize * RESOURCE_ESTIMATES.cement_bags), unit: 'كيس' },
      { name: 'حديد', value: Math.ceil(areaSize * RESOURCE_ESTIMATES.iron_kg / 1000 * 10) / 10, unit: 'طن' }, // Rounded to 1 decimal
      { name: 'طابوق', value: Math.ceil(areaSize * RESOURCE_ESTIMATES.brick_count), unit: 'طابوقة' },
      { name: 'رمل', value: Math.ceil(areaSize * RESOURCE_ESTIMATES.sand_m3), unit: 'م³' },
      { name: 'حصى', value: Math.ceil(areaSize * RESOURCE_ESTIMATES.gravel_m3), unit: 'م³' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:hidden mt-6">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Icon name="package" className="text-amber-600" />
        <h3 className="font-bold text-slate-800">تقدير المواد الأولية (تقريبي)</h3>
      </div>
      
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {estimates.map((item) => (
              <div key={item.name} className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-bold mb-1">{item.name}</span>
                  <span className="text-lg font-bold text-slate-800">{item.value}</span>
                  <span className="text-xs text-slate-400">{item.unit}</span>
              </div>
          ))}
      </div>
      <div className="px-6 pb-4 text-[10px] text-slate-400 text-center">
          * هذه الكميات تقديرية وتعتمد على مخططات البناء الفعلية
      </div>
    </div>
  );
};