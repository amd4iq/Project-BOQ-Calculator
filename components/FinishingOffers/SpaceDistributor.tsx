import React, { useMemo } from 'react';
import { Space } from '../../types';
import { Icon } from '../Icons';

interface SpaceDistributorProps {
  spaces: Space[];
  totalArea: number;
  onChange: (spaces: Space[]) => void;
  isReadOnly: boolean;
}

export const SpaceDistributor: React.FC<SpaceDistributorProps> = ({ spaces, totalArea, onChange, isReadOnly }) => {
  const distributedArea = useMemo(() => {
    return spaces.reduce((sum, space) => sum + (space.weight || 0), 0);
  }, [spaces]);

  const remainingArea = totalArea - distributedArea;
  const isBalanced = Math.abs(remainingArea) < 0.01;

  const handleAddSpace = () => {
    const newSpace: Space = {
      id: `sp-${Date.now()}`,
      name: '',
      weight: 0,
    };
    onChange([...spaces, newSpace]);
  };

  const handleUpdateSpace = (id: string, field: keyof Space, value: string | number) => {
    const newSpaces = spaces.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    onChange(newSpaces);
  };

  const handleRemoveSpace = (id: string) => {
    onChange(spaces.filter(s => s.id !== id));
  };

  const handleAutofillLast = () => {
    if (spaces.length === 0 || remainingArea <= 0) return;
    const lastSpace = spaces[spaces.length - 1];
    const newWeight = (lastSpace.weight || 0) + remainingArea;
    handleUpdateSpace(lastSpace.id, 'weight', parseFloat(newWeight.toFixed(2)));
  };

  return (
    <>
      <div className="my-4">
        <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold text-slate-500">المساحة الموزعة / الإجمالية</span>
            <span className={`font-bold font-mono ${isBalanced ? 'text-emerald-600' : 'text-rose-500'}`}>
                {distributedArea.toFixed(1)} م² / {totalArea.toFixed(1)} م²
            </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-300 ${isBalanced ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${totalArea > 0 ? (distributedArea / totalArea) * 100 : 0}%` }}
            ></div>
        </div>
        {!isBalanced && (
            <div className="text-xs text-center mt-2 font-bold flex items-center justify-center gap-2">
               <span className="text-rose-500">
                 {remainingArea > 0 ? `المتبقي للتوزيع: ${remainingArea.toFixed(1)} م²` : `المساحة تتجاوز الإجمالي بـ: ${Math.abs(remainingArea).toFixed(1)} م²`}
               </span>
               {remainingArea > 0 && spaces.length > 0 && !isReadOnly && (
                   <button onClick={handleAutofillLast} className="text-primary-600 underline text-[11px]">املأ المتبقي</button>
               )}
            </div>
        )}
      </div>

      <div className="space-y-2">
        {spaces.map((space, index) => (
          <div key={space.id} className="grid grid-cols-12 gap-2 items-center group">
             <input
                type="text"
                value={space.name}
                onChange={(e) => handleUpdateSpace(space.id, 'name', e.target.value)}
                placeholder={`فضاء ${index + 1} (مثال: الصالة)`}
                className="col-span-7 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:border-primary-400 outline-none transition-all text-sm disabled:bg-slate-100 disabled:text-slate-500"
                disabled={isReadOnly}
              />
              <div className="col-span-4 relative">
                 <input
                  type="number"
                  step="0.1"
                  value={space.weight || ''}
                  onChange={(e) => handleUpdateSpace(space.id, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-center text-sm font-bold outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="المساحة"
                  disabled={isReadOnly}
                 />
                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">م²</span>
              </div>
              <div className="col-span-1 text-center">
                  {!isReadOnly && (
                    <button
                        onClick={() => handleRemoveSpace(space.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Icon name="trash" size={16} />
                    </button>
                  )}
              </div>
          </div>
        ))}
      </div>

       <button
          onClick={handleAddSpace}
          className="mt-3 w-full text-xs font-bold text-slate-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary-300 transition-colors flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:border-slate-200"
          disabled={isReadOnly}
      >
          <Icon name="plus" size={14}/>
          إضافة فضاء
      </button>
    </>
  );
};