
import React, { useState } from 'react';
import { ProjectDetails, AreaRow, QuoteType } from '../core/types.ts';
import { Icon } from './Icons.tsx';
import { AreaCalculator } from './ConstructionOffers/AreaCalculator.tsx';
import { AreaBreakdownDetails } from './ConstructionOffers/AreaBreakdownDetails.tsx';
import { SpaceDistributor } from './FinishingOffers/SpaceDistributor.tsx';

interface ProjectInfoProps {
  details: ProjectDetails;
  quoteType: QuoteType;
  onChange: (field: keyof ProjectDetails, value: any) => void;
  onUpdateBreakdown: (breakdown: AreaRow[]) => void;
  savedBreakdown?: AreaRow[];
  quoteTotals: any;
  isReadOnly: boolean;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ details, quoteType, onChange, onUpdateBreakdown, savedBreakdown, quoteTotals, isReadOnly }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const allocationMode = details.specAllocationMode || (details.enableSpaceDistribution ? 'spaces' : 'percentage');
  const isAllocationEnabled = details.enableSpaceDistribution; 

  const handleAllocationToggle = (enabled: boolean) => {
      onChange('enableSpaceDistribution', enabled);
      if (enabled && !details.specAllocationMode) {
          onChange('specAllocationMode', 'spaces');
      }
  };

  const handleModeChange = (mode: 'spaces' | 'percentage') => {
      onChange('specAllocationMode', mode);
  };

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
                            <p className="text-xs text-blue-600 opacity-80">يتم احتساب التكلفة بناءً على المساحة</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onChange('showAreaBreakdownUi', !details.showAreaBreakdownUi); }}
                            className={`p-3 rounded-xl border shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed ${details.showAreaBreakdownUi ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-200'}`}
                            title={details.showAreaBreakdownUi ? "إخفاء تفاصيل الذرعة" : "عرض تفاصيل الذرعة"}
                            disabled={isReadOnly}
                         >
                             <Icon name="bar-chart" size={20} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); setIsCalculatorOpen(true); }}
                            className="bg-white hover:bg-blue-50 text-blue-500 hover:text-blue-600 p-3 rounded-xl border border-blue-200 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                            title="حاسبة المساحة (جمع الطوابق والأشكال)"
                            disabled={isReadOnly}
                         >
                             <Icon name="calculator" size={20} />
                         </button>

                         <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-blue-200 shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
                            <input
                                type="number"
                                min="1"
                                value={details.areaSize}
                                onChange={(e) => onChange('areaSize', Number(e.target.value))}
                                className="w-full sm:w-32 text-center text-2xl font-black text-slate-800 outline-none bg-transparent disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="0"
                                readOnly={isReadOnly}
                            />
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-sm select-none">م²</span>
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                            placeholder="اسم الزبون الكامل"
                            readOnly={isReadOnly}
                        />
                        <input
                            type="text"
                            value={details.customerNumber}
                            onChange={(e) => onChange('customerNumber', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                            placeholder="07xxxxxxxxx"
                            readOnly={isReadOnly}
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                            placeholder="عنوان المشروع"
                            readOnly={isReadOnly}
                        />
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={details.employeeName}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm outline-none cursor-not-allowed"
                                placeholder="اسم الموظف"
                                readOnly
                            />
                            <input
                                type="date"
                                value={details.date}
                                onChange={(e) => onChange('date', e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-mono disabled:bg-slate-100 disabled:text-slate-500"
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </div>
                
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
                    <label htmlFor="enableBudgeting" className={`flex items-center ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="enableBudgeting"
                          className="sr-only peer"
                          checked={!!details.enableBudgeting}
                          onChange={(e) => onChange('enableBudgeting', e.target.checked)}
                          disabled={isReadOnly}
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
                          className="w-full pr-10 pl-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="ادخل ميزانية الزبون"
                          readOnly={isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {details.showAreaBreakdownUi && savedBreakdown && savedBreakdown.length > 0 && details.areaSize > 0 && (
                   <AreaBreakdownDetails breakdown={savedBreakdown} totalArea={details.areaSize} />
                )}

                {quoteType === 'finishes' && (
                  <div className={`mt-6 p-6 rounded-2xl border transition-all duration-300 ${isAllocationEnabled ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <Icon name="layers" size={18} className="text-indigo-600" />
                          تخصيص المواصفات
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          تفعيل هذا الخيار يسمح بتخصيص مواصفات مختلفة (إما حسب الفضاء أو حسب النسب المئوية).
                        </p>
                      </div>
                      
                      <label htmlFor="enableSpaceDistribution" className={`flex items-center ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} self-end sm:self-auto`}>
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="enableSpaceDistribution"
                            className="sr-only peer"
                            checked={!!isAllocationEnabled}
                            onChange={(e) => handleAllocationToggle(e.target.checked)}
                            disabled={isReadOnly}
                          />
                          <div className="block bg-slate-300 peer-checked:bg-indigo-600 w-12 h-7 rounded-full transition-colors"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                      </label>
                    </div>

                    {isAllocationEnabled && (
                      <div className="mt-4 pt-4 border-t border-indigo-100 animate-in fade-in duration-500">
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-1 rounded-xl border border-indigo-100 inline-flex shadow-sm">
                                <button
                                    onClick={() => handleModeChange('spaces')}
                                    disabled={isReadOnly}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${allocationMode === 'spaces' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Icon name="sofa" size={14} />
                                    حسب الفضاءات
                                </button>
                                <button
                                    onClick={() => handleModeChange('percentage')}
                                    disabled={isReadOnly}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${allocationMode === 'percentage' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Icon name="pie-chart" size={14} />
                                    حسب النسب (%)
                                </button>
                            </div>
                        </div>

                        {allocationMode === 'spaces' && (
                            <div className="animate-in fade-in duration-300">
                                <SpaceDistributor 
                                spaces={details.spaces || []}
                                totalArea={details.areaSize}
                                onChange={(newSpaces) => onChange('spaces', newSpaces)}
                                isReadOnly={isReadOnly}
                                />
                            </div>
                        )}

                        {allocationMode === 'percentage' && (
                             <div className="animate-in fade-in duration-300 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center">
                                <div className="inline-block p-3 bg-white rounded-full text-indigo-500 mb-2 shadow-sm"><Icon name="pie-chart" size={24}/></div>
                                <h5 className="font-bold text-indigo-900 text-sm">نظام النسب المئوية مفعل</h5>
                                <p className="text-xs text-indigo-700 mt-1 max-w-sm mx-auto">
                                    يمكنك الآن تحديد نسب مئوية لكل خيار مباشرة من بطاقات المواصفات الفنية أدناه.
                                </p>
                             </div>
                        )}
                      </div>
                    )}
                  </div>
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
