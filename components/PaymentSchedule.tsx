
import React, { useState } from 'react';
import { PaymentStage } from '../types';
import { formatCurrency } from '../utils/format';
import { Icon } from './Icons';

interface PaymentScheduleProps {
  schedule: PaymentStage[];
  totalAmount: number;
  onChange: (schedule: PaymentStage[]) => void;
  isReadOnly: boolean;
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ schedule, totalAmount, onChange, isReadOnly }) => {
  const totalPercentage = schedule.reduce((sum, item) => sum + item.percentage, 0);
  // Allow slight floating point error tolerance
  const isTotalValid = Math.abs(totalPercentage - 100) < 0.1;
  const remainingPercentage = 100 - totalPercentage;

  const handleUpdate = (id: string, field: keyof PaymentStage, value: any) => {
    if (isReadOnly) return;
    const newSchedule = schedule.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newSchedule);
  };

  const handleAddStage = () => {
    if (isReadOnly) return;
    const remaining = Math.max(0, 100 - totalPercentage);
    const newStage: PaymentStage = {
      id: `pay-${Date.now()}`,
      name: 'دفعة جديدة',
      percentage: remaining
    };
    onChange([...schedule, newStage]);
  };

  const handleDeleteStage = (id: string) => {
    if (isReadOnly) return;
    if (schedule.length <= 1) {
        alert("يجب أن يحتوي الجدول على دفعة واحدة على الأقل");
        return;
    }
    onChange(schedule.filter(s => s.id !== id));
  };

  const handleAutoFix = () => {
      if (isReadOnly || schedule.length === 0) return;
      
      const diff = 100 - totalPercentage;
      const newSchedule = [...schedule];
      const lastIndex = newSchedule.length - 1;
      
      const newPct = newSchedule[lastIndex].percentage + diff;
      
      if (newPct < 0) {
          alert('لا يمكن التصحيح التلقائي، النسب مرتفعة جداً.');
          return;
      }

      newSchedule[lastIndex] = {
          ...newSchedule[lastIndex],
          percentage: Number(newPct.toFixed(2)) // Prevent long decimals
      };
      
      onChange(newSchedule);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col print:border-none print:shadow-none print:rounded-none ${isReadOnly ? 'opacity-70' : ''}`}>
      
      {/* Visual Progress Bar (Screen Only) */}
      <div className="h-3 w-full flex print:hidden bg-slate-100 border-b border-slate-100">
          {schedule.map((stage, idx) => {
             const colors = ['bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];
             const colorClass = colors[idx % colors.length];
             return (
                 <div 
                    key={stage.id} 
                    className={`${colorClass} h-full relative group transition-all duration-300`} 
                    style={{ width: `${stage.percentage}%` }}
                    title={`${stage.name}: ${stage.percentage}%`}
                 >
                 </div>
             );
          })}
          {totalPercentage < 100 && (
              <div className="bg-slate-200 h-full flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-300/20" style={{backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
              </div>
          )}
      </div>

      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg shadow-sm text-primary-600 print:hidden border border-slate-200">
                <Icon name="briefcase" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 print:text-black text-lg">جدول الدفعات المالية</h3>
                <p className="text-xs text-slate-500 print:hidden font-medium">نظام الدفعات المجزأة</p>
            </div>
        </div>
        
        {/* Validation Badges */}
        <div className="flex items-center gap-2 print:hidden">
            {!isTotalValid ? (
                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${totalPercentage > 100 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    <span>المجموع: {totalPercentage.toFixed(1)}%</span>
                    {totalPercentage < 100 && !isReadOnly && (
                        <button onClick={handleAutoFix} className="underline hover:text-amber-800 ml-1">
                            (تصحيح)
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    <Icon name="check" size={14} />
                    مكتمل 100%
                </div>
            )}
        </div>
      </div>
      
      {/* Print Header */}
      <div className="hidden print:block">
          <h3 className="print-title-bar mt-6">جدول الدفعات المالية</h3>
      </div>

      <div className="p-6 print:p-0 flex-1 flex flex-col">
        <div className="overflow-hidden rounded-lg border border-slate-200 print:border-none print:rounded-none">
            <table className="w-full text-sm print-table border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 print:bg-slate-100 print:border-black print:text-black">
                        <th className="text-right py-3 px-4 font-extrabold w-[55%] border-r border-slate-200 print:border print:border-black">المرحلة / وصف الدفعة</th>
                        <th className="text-center py-3 px-4 font-extrabold w-[20%] border-r border-slate-200 print:border print:border-black">النسبة (%)</th>
                        <th className="text-left py-3 px-4 font-extrabold w-[25%] print:border print:border-black">القيمة المالية</th>
                        <th className="w-[5%] print:hidden bg-slate-50"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black">
                    {schedule.map((stage, idx) => {
                        const amount = totalAmount * (stage.percentage / 100);
                        const colors = ['bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];
                        const dotColor = colors[idx % colors.length];

                        return (
                            <tr key={stage.id} className="group hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                                <td className="p-2 border-r border-slate-200 print:border print:border-black">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor} print:hidden flex-shrink-0 mx-1`}></div>
                                        <input 
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => handleUpdate(stage.id, 'name', e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-white focus:bg-white px-3 py-2 rounded-md border border-transparent hover:border-slate-200 focus:border-primary-300 outline-none text-xs font-bold text-slate-700 print:text-black print:bg-transparent print:p-0 print:border-none transition-all placeholder:text-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                            placeholder="اسم المرحلة..."
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                </td>
                                <td className="p-2 text-center border-r border-slate-200 print:border print:border-black align-middle">
                                    <div className="flex items-center justify-center">
                                        <input 
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={stage.percentage}
                                            onChange={(e) => handleUpdate(stage.id, 'percentage', Number(e.target.value))}
                                            className="w-16 text-center bg-slate-50 hover:bg-white focus:bg-white px-1 py-1.5 rounded-md border border-slate-200 focus:border-primary-300 outline-none font-bold font-mono text-slate-800 print:text-black print:bg-transparent print:p-0 print:border-none print:w-auto disabled:bg-slate-100 disabled:cursor-not-allowed"
                                            disabled={isReadOnly}
                                        />
                                        <span className="text-slate-400 text-xs font-bold mr-1 print:text-black">%</span>
                                    </div>
                                </td>
                                <td className="p-2 text-left font-mono font-bold text-slate-800 print:border print:border-black print:text-black align-middle">
                                    <div className="px-3 py-1.5 print:px-2 print:py-1 rounded bg-slate-50 border border-slate-100 print:bg-transparent print:border-none print:p-0">
                                        {formatCurrency(amount)}
                                    </div>
                                </td>
                                <td className="print:hidden text-center p-2 bg-slate-50/30">
                                    {!isReadOnly && (
                                    <button 
                                        onClick={() => handleDeleteStage(stage.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-all"
                                        title="حذف الدفعة"
                                    >
                                        <Icon name="trash" size={16} />
                                    </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 print:border-black">
                    <tr>
                        <td className="py-4 px-4 font-black text-slate-800 border-r border-slate-200 print:border print:border-black bg-slate-50 print:bg-slate-100">
                            المجموع الكلي
                        </td>
                        <td className={`py-4 px-4 text-center font-black border-r border-slate-200 print:border print:border-black bg-slate-50 print:bg-slate-100 font-mono text-lg ${!isTotalValid ? 'text-red-600' : 'text-emerald-600'}`}>
                            {totalPercentage.toFixed(0)}%
                        </td>
                        <td className="py-4 px-4 text-left font-black text-lg print:text-[10pt] text-slate-900 print:border print:border-black bg-slate-50 print:bg-slate-100">
                            {formatCurrency(totalAmount)}
                        </td>
                        <td className="print:hidden bg-slate-50"></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* Add Button */}
        <div className="mt-4 print:hidden">
            {!isReadOnly && (
            <button 
                onClick={handleAddStage}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 group"
            >
                <div className="bg-slate-100 group-hover:bg-primary-200 rounded-full p-1 transition-colors">
                    <Icon name="plus" size={16} />
                </div>
                اضافة دفعة جديدة
            </button>
            )}
        </div>
      </div>
    </div>
  );
};
