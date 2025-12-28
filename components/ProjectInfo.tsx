import React, { useState } from 'react';
import { ProjectDetails, AreaRow } from '../types';
import { Icon } from './Icons';
import { AreaCalculator } from './AreaCalculator';

interface ProjectInfoProps {
  details: ProjectDetails;
  onChange: (field: keyof ProjectDetails, value: any) => void;
  onUpdateBreakdown: (breakdown: AreaRow[]) => void;
  savedBreakdown?: AreaRow[];
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ details, onChange, onUpdateBreakdown, savedBreakdown }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <>
      {/* SCREEN VIEW */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Header / Toggle */}
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

        {/* Collapsible Content */}
        {isExpanded && (
            <div className="p-6 animate-in slide-in-from-top-2 duration-200">
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                            <Icon name="ruler" size={24} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-blue-900 mb-1">مساحة البناء الإجمالية</label>
                            <p className="text-xs text-blue-600 opacity-80">يتم احتساب التكلفة بناءً على هذه المساحة</p>
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
            </div>
        )}
      </div>

      <div className="hidden print:block mb-4">
        <div className="print-box grid grid-cols-2">
            <div className="p-1.5 border-b border-l border-black">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">اسم المشروع / العنوان</span>
                <span className="block font-bold text-black text-xs">{details.projectName || '----------------'}</span>
            </div>
            <div className="p-1.5 border-b border-black">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">المساحة (م²)</span>
                <span className="block font-bold text-black text-xs">{details.areaSize} م²</span>
            </div>
            <div className="p-1.5 border-b border-l border-black">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">اسم الزبون</span>
                <span className="block font-bold text-black text-xs">{details.customerName || '----------------'}</span>
            </div>
            <div className="p-1.5 border-b border-black">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">رقم الهاتف</span>
                <span className="block font-bold text-black text-xs font-mono">{details.customerNumber || '----------------'}</span>
            </div>
            <div className="p-1.5 border-l border-black">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">الموظف المسؤول</span>
                <span className="block font-bold text-black text-xs">{details.employeeName || '----------------'}</span>
            </div>
            <div className="p-1.5">
                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">التاريخ</span>
                <span className="block font-bold text-black text-xs font-mono">{details.date}</span>
            </div>
        </div>
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