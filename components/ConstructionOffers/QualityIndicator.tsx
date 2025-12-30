
import React from 'react';
import { Category, SelectionState, CategorySelection, QuoteType } from '../../types';
import { Icon } from '../Icons';

interface QualityIndicatorProps {
  categories: Category[];
  selections: SelectionState;
  quoteType: QuoteType;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({ categories, selections, quoteType }) => {
  
  const calculateStructureScore = () => {
    let score = 0;

    // 1. Brick Type
    const brickSelection = selections['brick'] as CategorySelection;
    if (brickSelection?.default === 'brick-red') score += 2;

    // 2. Ceiling Height
    const heightSelection = selections['height'] as CategorySelection;
    if (heightSelection?.default === 'h-33-35') score += 2;
    if (heightSelection?.default === 'h-36-40') score += 3;

    // 3. Cleaning Slab
    const cleaningSelection = selections['cleaning'] as CategorySelection;
    if (cleaningSelection?.default === 'clean-with') score += 1;

    // 4. Additions
    const additions = selections['fixed_additions'];
    const additionsList = Array.isArray(additions) ? additions : [];
    
    if (additionsList.length >= 1 && additionsList.length <= 2) score += 1;
    if (additionsList.length >= 3) score += 2;
    
    // Premium items bonus
    if (additionsList.includes('gate-cnc')) score += 2;

    return score;
  };

  const calculateFinishesScore = () => {
    let score = 0;

    // 1. Flooring (High impact)
    const flooringSelection = selections['flooring'] as CategorySelection;
    if (flooringSelection?.default === 'floor-marble' || flooringSelection?.default === 'floor-custom') score += 3;
    else if (flooringSelection?.default === 'floor-porcelain') score += 1;

    // 2. Wall Finishes
    const wallSelection = selections['wall_finishes'] as CategorySelection;
    if (wallSelection?.default === 'wall-slabs') score += 3;
    if (wallSelection?.default === 'wall-custom') score += 2;
    if (wallSelection?.default === 'wall-adv') score += 1;

    // 3. Windows
    const winSelection = selections['windows'] as CategorySelection;
    if (winSelection?.default === 'win-custom') score += 2;
    if (winSelection?.default === 'win-adv') score += 1;

    // 4. Sanitary (Luxury items)
    const sanitary = selections['sanitary'];
    const sanitaryList = Array.isArray(sanitary) ? sanitary : [];
    if (sanitaryList.includes('sn-jacuzzi')) score += 2;
    if (sanitaryList.includes('sn-partition-custom') || sanitaryList.includes('sn-sink-custom')) score += 1;

    // 5. Electrical
    const lightingSelection = selections['lighting'] as CategorySelection;
    if (lightingSelection?.default === 'l-custom' || lightingSelection?.default === 'l-advanced') score += 1;

    return score;
  };

  const score = Math.min(quoteType === 'structure' ? calculateStructureScore() : calculateFinishesScore(), 10);

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
        {quoteType === 'structure' 
            ? 'يعتمد هذا المؤشر على نوع الطابوق، ارتفاع السقف، واستخدام صبة النظافة.'
            : 'يعتمد هذا المؤشر على جودة الأرضيات (مرمر/بورسلان)، نوع تغليف الجدران، ونوعية الصحيات والشبابيك.'
        }
      </p>
    </div>
  );
};
