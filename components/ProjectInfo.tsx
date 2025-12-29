import React, { useState, useMemo } from 'react';
import { ProjectDetails, AreaRow, QuoteType, Space } from '../types';
import { Icon } from './Icons';
import { AreaCalculator } from './AreaCalculator';
import { formatCurrency } from '../utils/format';

const LevelSelector: React.FC<{
  activeLevels: string[];
  onChange: (activeLevels: string[]) => void;
}> = ({ activeLevels, onChange }) => {
  const allLevels = Array.from({ length: 10 }, (_, i) => ({
    id: `level-${i + 1}`,
    value: i + 1,
  }));

  const totalPercentage = useMemo(() => {
    return activeLevels.reduce((sum, levelId) => {
      const levelValue = parseInt(levelId.split('-')[1]);
      return sum + (levelValue * 10);
    }, 0);
  }, [activeLevels]);

  const handleToggleLevel = (levelId: string, levelValue: number) => {
    const isCurrentlyActive = activeLevels.includes(levelId);
    if (!isCurrentlyActive && (totalPercentage + (levelValue * 10) > 100)) {
        // Prevent adding if it exceeds 100%
        return;
    }

    const newLevels = isCurrentlyActive
      ? activeLevels.filter(l => l !== levelId)
      : [...activeLevels, levelId];
    
    onChange(newLevels.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])));
  };

  return (
    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
      <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Icon name="sofa" size={18} className="text-primary-600" />
        توزيع نسب المشروع
      </h4>
      <p className="text-xs text-slate-500 mt-1 pr-1">
        حدد المستويات لتقسيم المشروع. رقم المستوى يمثل نسبته المئوية (مثال: المستوى 3 = 30%). يجب أن لا يتجاوز المجموع 100%.
      </p>

       <div className="my-4">
        <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold text-slate-500">النسبة المئوية الموزعة</span>
            <span className={`font-bold ${totalPercentage > 100 ? 'text-rose-500' : 'text-emerald-600'}`}>
                {totalPercentage}% / 100%
            </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-300 ${totalPercentage > 100 ? 'bg-rose-500' : 'bg-primary-500'}`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            ></div>
        </div>
        {totalPercentage > 100 && (
            <p className="text-xs text-center text-rose-500 mt-2 font-bold">
                المجموع يتجاوز 100%. يرجى تعديل الاختيارات.
            </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-3">
        {allLevels.map(({ id, value }) => {
          const isChecked = activeLevels.includes(id);
          const isDisabled = !isChecked && (totalPercentage + (value * 10) > 100);

          return (
            <div key={id}>
              <input
                type="checkbox"
                id={id}
                checked={isChecked}
                onChange={() => handleToggleLevel(id, value)}
                disabled={isDisabled}
                className="hidden peer"
              />
              <label
                htmlFor={id}
                className={`
                  block p-3 text-center rounded-xl border-2 transition-all duration-200
                  ${isDisabled 
                    ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                    : `cursor-pointer bg-white border-slate-200 text-slate-500 hover:border-slate-400 
                       peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 peer-checked:shadow-sm`
                  }
                `}
              >
                <span className="font-black text-lg sm:text-xl">{value}</span>
                <span className="block text-xs font-bold mt-1">مستوى</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};


interface ProjectInfoProps {
  details: ProjectDetails;
  quoteType: QuoteType;
  onChange: (field: keyof ProjectDetails, value: any) => void;
  onUpdateBreakdown: (breakdown: AreaRow[]) => void;
  onUpdateSpaces: (spaces: Space[]) => void;
  savedBreakdown?: AreaRow[];
  quoteTotals: any;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ details, quoteType, onChange, onUpdateBreakdown, onUpdateSpaces, savedBreakdown, quoteTotals }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden overflow-hidden transition-all duration-300 hover:shadow-md">
        <div 
            className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 cursor-pointer select-none group"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon name="file-text" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">بيانات المشروع</h3>
                    <p className="text-xs text-slate-500">
                        {details.projectName || 'مشروع جديد'} • {details.customerName || 'عميل غير محدد'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 {!isExpanded && (
                     <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-1">
                        <Icon name="ruler" size={14} />
                        {details.areaSize} م²
                     </div>
                 )}
                 <Icon name="chevron" className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
        </div>

        {isExpanded && (
            <div className="p-6 animate-in slide-in-from-top-2 duration-200">
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                            <Icon name="ruler" size={24} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-blue-900 mb-1">المعايير الأساسية</label>
                            <p className="text-xs text-blue-600 opacity-80">يتم احتساب التكلفة بناءً على المساحة وعدد الطوابق</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setIsCalculatorOpen(true); }}
                            className="bg-white hover:bg-blue-50 text-blue-500 hover:text-blue-600 p-3 rounded-xl border border-blue-200 shadow-sm transition-all active:scale-95"
                            title="حاسبة المساحة (جمع الطوابق والأشكال)"
                         >
                             <Icon name="calculator" size={20} />
                         </button>

                         <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-blue-200 shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
                            <input
                                type="number"
                                min="1"
                                value={details.areaSize}
                                onChange={(e) => onChange('areaSize', Number(e.target.value))}
                                className="w-full sm:w-32 text-center text-2xl font-black text-slate-800 outline-none bg-transparent"
                                placeholder="0"
                            />
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-sm select-none">م²</span>
                         </div>
                         <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-blue-200 shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
                            <Icon name="building-floors" size={16} className="text-slate-400 ml-2" />
                            <input
                                type="number"
                                min="1"
                                value={details.numberOfFloors}
                                onChange={(e) => onChange('numberOfFloors', Number(e.target.value))}
                                className="w-full sm:w-16 text-center text-2xl font-black text-slate-800 outline-none bg-transparent"
                                placeholder="1"
                            />
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-sm select-none">طابق</span>
                         </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <Icon name="user" size={12} />
                             معلومات العميل
                        </h4>
                        <input
                            type="text"
                            value={details.customerName}
                            onChange={(e) => onChange('customerName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="اسم الزبون الكامل"
                        />
                        <input
                            type="text"
                            value={details.customerNumber}
                            onChange={(e) => onChange('customerNumber', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="07xxxxxxxxx"
                        />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Icon name="briefcase" size={12} />
                            تفاصيل العرض
                        </h4>
                        <input
                            type="text"
                            value={details.projectName}
                            onChange={(e) => onChange('projectName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="عنوان المشروع"
                        />
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={details.employeeName}
                                onChange={(e) => onChange('employeeName', e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="اسم الموظف"
                            />
                            <input
                                type="date"
                                value={details.date}
                                onChange={(e) => onChange('date', e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Enhanced Budgeting Tool */}
                <div className={`mt-6 p-6 rounded-2xl border transition-all duration-300 ${details.enableBudgeting ? 'bg-primary-50/50 border-primary-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon name="pie-chart" size={18} className="text-primary-600" />
                        أداة الميزانية
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        قارن التكلفة الإجمالية مع ميزانية الزبون المستهدفة.
                      </p>
                    </div>
                    <label htmlFor="enableBudgeting" className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="enableBudgeting"
                          className="sr-only peer"
                          checked={!!details.enableBudgeting}
                          onChange={(e) => onChange('enableBudgeting', e.target.checked)}
                        />
                        <div className="block bg-slate-300 peer-checked:bg-primary-600 w-12 h-7 rounded-full transition-colors"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>

                  {details.enableBudgeting && (
                    <div className="mt-4 pt-4 border-t border-primary-100 animate-in fade-in duration-500">
                      <label className="text-sm font-bold text-slate-600 mb-2 block">
                        الميزانية المستهدفة (IQD)
                      </label>
                      <div className="relative">
                        <Icon name="calculator" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="number"
                          value={details.targetBudget || ''}
                          onChange={(e) => onChange('targetBudget', Number(e.target.value))}
                          className="w-full pr-10 pl-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-slate-400"
                          placeholder="ادخل ميزانية الزبون"
                        />
                      </div>
                    </div>
                  )}
                </div>


                {quoteType === 'finishes' && (
                    <LevelSelector 
                        activeLevels={details.activeLevels || []}
                        onChange={(newLevels) => onChange('activeLevels', newLevels)}
                    />
                )}
            </div>
        )}
      </div>
      
      <AreaCalculator 
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApply={(total, breakdown) => {
            onChange('areaSize', total);
            onUpdateBreakdown(breakdown);
        }}
        currentArea={details.areaSize}
        savedBreakdown={savedBreakdown}
      />
    </>
  );
};