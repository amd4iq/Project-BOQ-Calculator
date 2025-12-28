import React from 'react';
import { Category, SelectionState } from '../types';
import { Icon } from './Icons';

interface QualityIndicatorProps {
  categories: Category[];
  selections: SelectionState;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({ categories, selections }) => {
  // Logic to calculate quality score (0-10)
  const calculateScore = () => {
    let score = 0;

    // 1. Brick Type
    const brickSelection = selections['brick'];
    if (brickSelection === 'brick-red') score += 2;

    // 2. Ceiling Height
    const heightSelection = selections['height'];
    if (heightSelection === 'h-35') score += 2;
    if (heightSelection === 'h-36') score += 3;

    // 3. Cleaning Slab
    const cleaningSelection = selections['cleaning'];
    if (cleaningSelection === 'clean-with') score += 1;

    // 4. Additions
    const additions = selections['fixed_additions'];
    const additionsList = Array.isArray(additions) ? additions : [];
    
    if (additionsList.length >= 1 && additionsList.length <= 2) score += 1;
    if (additionsList.length >= 3) score += 2;
    
    // Premium items bonus
    if (additionsList.includes('gate-cnc')) score += 2;

    return Math.min(score, 10);
  };

  const score = calculateScore();

  const getStatus = () => {
    if (score <= 3) return { label: 'اقتصادي', color: 'bg-slate-500', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'zap' };
    if (score <= 7) return { label: 'متوازن', color: 'bg-primary-600', text: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200', icon: 'check' };
    return { label: 'فاخر', color: 'bg-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'zap' };
  };

  const status = getStatus();

  return (
    <div className={`p-5 rounded-2xl border ${status.bg} ${status.border} transition-all duration-500`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`${status.color} text-white p-1.5 rounded-lg shadow-sm`}>
            <Icon name={status.icon} size={16} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">مؤشر جودة المواصفات</span>
            <span className={`block font-black text-sm ${status.text}`}>{status.label}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400">التقييم</span>
          <span className="block text-lg font-black text-slate-700">{score}/10</span>
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="flex gap-1 h-2">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-700 delay-[${i * 50}ms] ${
              i < score ? status.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      
      <p className="mt-3 text-[10px] text-slate-500 font-medium leading-relaxed">
        يعتمد هذا المؤشر على مستوى المواد المختارة، ارتفاع السقف، وحجم الإضافات الملحقة بالمشروع.
      </p>
    </div>
  );
};
