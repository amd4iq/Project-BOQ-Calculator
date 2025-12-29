
import React, { useState, useMemo } from 'react';
import { ProjectDetails, AreaRow, QuoteType, Space } from '../types';
import { Icon } from './Icons';
import { AreaCalculator } from './AreaCalculator';

interface ProjectSpacesProps {
  spaces: Space[];
  onUpdate: (spaces: Space[]) => void;
  totalArea: number;
}

const ProjectSpaces: React.FC<ProjectSpacesProps> = ({ spaces, onUpdate, totalArea }) => {
  const [newSpaceName, setNewSpaceName] = useState('');

  const handleAddSpace = () => {
    if (!newSpaceName.trim()) return;
    const newSpace: Space = {
      id: Date.now().toString(),
      name: newSpaceName.trim(),
      weight: 0,
    };
    onUpdate([...spaces, newSpace]);
    setNewSpaceName('');
  };

  const handleUpdateSpace = (id: string, field: 'name' | 'weight', value: any) => {
    const updated = spaces.map(s => {
      if (s.id === id) {
        const newValue = field === 'weight' ? Math.max(0, Math.min(100, Number(value))) : value;
        return { ...s, [field]: newValue };
      }
      return s;
    });
    onUpdate(updated);
  };

  const handleRemoveSpace = (id: string) => {
    onUpdate(spaces.filter(s => s.id !== id));
  };

  const totalWeight = useMemo(() => spaces.reduce((sum, s) => sum + (s.weight || 0), 0), [spaces]);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;

  return (
    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="mb-4">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Icon name="sofa" size={18} className="text-primary-600" />
            تخصيص المواصفات حسب الفضاء
        </h4>
        <p className="text-xs text-slate-500 mt-1 pr-1">
          أضف الفضاءات وحدد وزنها النسبي من المساحة الكلية (يجب ان يكون المجموع 100%).
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold text-slate-500">الوزن النسبي الإجمالي</span>
            <span className={`font-bold ${isWeightValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                {totalWeight.toFixed(1)}% / 100%
            </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-300 ${isWeightValid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
            ></div>
        </div>
        {!isWeightValid && (
            <p className="text-xs text-center text-rose-500 mt-2">
                يجب أن يكون مجموع الأوزان 100% لتفعيل التخصيص بشكل صحيح.
            </p>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        {spaces.map(space => {
            const calculatedArea = (space.weight / 100) * totalArea;
            return (
              <div key={space.id} className="grid grid-cols-12 items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="col-span-12 sm:col-span-5 flex items-center gap-2">
                    <Icon name="sofa" size={16} className="text-slate-400" />
                    <input 
                        type="text"
                        value={space.name}
                        onChange={e => handleUpdateSpace(space.id, 'name', e.target.value)}
                        className="font-bold text-sm text-slate-900 bg-transparent flex-1 outline-none p-1 focus:bg-slate-50 rounded"
                        placeholder="اسم الفضاء (مثال: غرفة نوم)"
                    />
                </div>
                <div className="col-span-4 sm:col-span-3">
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-1 focus-within:ring-1 ring-primary-300 w-full">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={space.weight || ''}
                            onChange={(e) => handleUpdateSpace(space.id, 'weight', e.target.value)}
                            className="w-full bg-transparent text-center font-bold text-sm text-slate-800 outline-none px-2"
                            placeholder="0"
                        />
                        <span className="text-xs font-bold text-slate-400 pr-2">%</span>
                    </div>
                </div>
                <div className="col-span-4 sm:col-span-3">
                    <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md p-1 h-[40px] text-center">
                        <span className="font-bold text-sm text-slate-700">{calculatedArea.toFixed(1)}</span>
                        <span className="text-xs font-bold text-slate-400 ml-1">م²</span>
                    </div>
                </div>
                <div className="col-span-4 sm:col-span-1 text-right sm:text-center">
                    <button onClick={() => handleRemoveSpace(space.id)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full">
                      <Icon name="x" size={16} />
                    </button>
                </div>
              </div>
            );
        })}
        {spaces.length === 0 && <p className="text-xs text-center text-slate-500 p-4">لم يتم إضافة أي فضاء. أضف الغرف والحمامات لتخصيص الإنهاءات.</p>}
      </div>

       <div className="grid grid-cols-12 items-center gap-3 p-2 bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm focus-within:border-primary-300 focus-within:border-solid">
         <div className="col-span-12 sm:col-span-8 flex items-center gap-2 pl-2">
            <Icon name="sofa" size={16} className="text-slate-400" />
            <input 
                type="text"
                value={newSpaceName}
                onChange={e => setNewSpaceName(e.target.value)}
                placeholder="اسم الفضاء الجديد..."
                className="flex-grow bg-transparent outline-none px-2 text-sm font-semibold"
            />
         </div>
         <div className="col-span-12 sm:col-span-4">
            <button onClick={handleAddSpace} className="w-full bg-primary-600 text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-primary-700 flex items-center justify-center gap-2 transition-all active:scale-95">
                <Icon name="plus" size={16}/>
                إضافة فضاء
            </button>
         </div>
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
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ details, quoteType, onChange, onUpdateBreakdown, onUpdateSpaces, savedBreakdown }) => {
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
                {quoteType === 'finishes' && (
                    <ProjectSpaces 
                        spaces={details.spaces || []} 
                        onUpdate={onUpdateSpaces}
                        totalArea={details.areaSize}
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