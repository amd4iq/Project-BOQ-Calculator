import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { AreaRow, AreaShape } from '../types';

interface AreaCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (totalArea: number, breakdown: AreaRow[]) => void;
  currentArea: number;
  savedBreakdown?: AreaRow[];
}

const QUICK_LABELS = ['الطابق الأرضي', 'الطابق الأول', 'السطح', 'المنور', 'الكراج', 'الحديقة'];

const SHAPES: { value: AreaShape; label: string; icon: string }[] = [
  { value: 'rectangle', label: 'مستطيل', icon: 'square' },
  { value: 'triangle', label: 'مثلث', icon: 'triangle' },
  { value: 'circle', label: 'دائرة', icon: 'circle' },
  { value: 'trapezoid', label: 'شبه منحرف', icon: 'layers' },
];

export const AreaCalculator: React.FC<AreaCalculatorProps> = ({ 
  isOpen, 
  onClose, 
  onApply,
  currentArea,
  savedBreakdown
}) => {
  const [rows, setRows] = useState<AreaRow[]>([]);
  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (savedBreakdown && savedBreakdown.length > 0) {
        setRows(savedBreakdown);
      } else {
        setRows([{ id: '1', label: 'الطابق الأرضي', shape: 'rectangle', dim1: 0, dim2: 0, dim3: 0 }]);
      }
    }
  }, [isOpen, savedBreakdown]);

  const handleAddRow = () => {
    setRows([
      ...rows, 
      { id: Date.now().toString(), label: '', shape: 'rectangle', dim1: 0, dim2: 0, dim3: 0 }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const handleUpdateRow = (id: string, field: keyof AreaRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const calculateRowArea = (row: AreaRow): number => {
    switch (row.shape) {
      case 'rectangle': return row.dim1 * row.dim2;
      case 'triangle': return 0.5 * row.dim1 * row.dim2;
      case 'circle': return Math.PI * Math.pow(row.dim1, 2);
      case 'trapezoid': return 0.5 * (row.dim1 + row.dim2) * row.dim3;
      default: return 0;
    }
  };

  const totalArea = rows.reduce((sum, row) => sum + calculateRowArea(row), 0);
  const diff = totalArea - currentArea;

  const handleApply = () => {
    onApply(Number(totalArea.toFixed(2)), rows);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-lg shadow-primary-200">
              <Icon name="calculator" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">حاسبة المساحة الهندسية</h2>
              <p className="text-sm text-slate-500">حساب المساحات المعقدة (مستطيل، مثلث، دائرة)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="mb-6">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">تسميات سريعة</span>
              <div className="flex flex-wrap gap-2">
                  {QUICK_LABELS.map(label => (
                      <button 
                        key={label}
                        onClick={() => {
                            const emptyRow = rows.find(r => !r.label);
                            if (emptyRow) handleUpdateRow(emptyRow.id, 'label', label);
                            else setRows([...rows, { id: Date.now().toString(), label, shape: 'rectangle', dim1: 0, dim2: 0, dim3: 0 }]);
                        }}
                        className="text-xs bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-all font-bold"
                      >
                          {label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="space-y-4">
            {rows.map((row, idx) => (
              <div key={row.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-primary-200 transition-all group">
                <div className="grid grid-cols-12 gap-3 items-center">
                  
                  {/* Shape & Label */}
                  <div className="col-span-12 md:col-span-4 space-y-2">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => handleUpdateRow(row.id, 'label', e.target.value)}
                      placeholder="اسم الجزء (مثلاً: الصالة)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold focus:border-primary-400 outline-none transition-all text-sm"
                    />
                    <div className="flex gap-1 p-1 bg-slate-200/50 rounded-lg">
                      {SHAPES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => handleUpdateRow(row.id, 'shape', s.value)}
                          className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all ${row.shape === s.value ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Icon name={s.icon} size={14} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="col-span-12 md:col-span-6 grid grid-cols-3 gap-2">
                    {row.shape === 'rectangle' && (
                      <>
                        <div className="relative">
                          <input type="number" step="0.1" value={row.dim1 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim1', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-bold outline-none" placeholder="الطول" />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-300">م</span>
                        </div>
                        <div className="flex items-center justify-center text-slate-300">×</div>
                        <div className="relative">
                          <input type="number" step="0.1" value={row.dim2 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim2', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-bold outline-none" placeholder="العرض" />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-300">م</span>
                        </div>
                      </>
                    )}
                    {row.shape === 'triangle' && (
                      <>
                        <div className="relative">
                          <input type="number" step="0.1" value={row.dim1 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim1', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-bold outline-none" placeholder="القاعدة" />
                        </div>
                        <div className="flex items-center justify-center text-slate-300">× الارتفاع / 2</div>
                        <div className="relative">
                          <input type="number" step="0.1" value={row.dim2 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim2', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-bold outline-none" placeholder="الارتفاع" />
                        </div>
                      </>
                    )}
                    {row.shape === 'circle' && (
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="relative flex-1">
                          <input type="number" step="0.1" value={row.dim1 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim1', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-bold outline-none" placeholder="نصف القطر" />
                          <label className="absolute -top-4 right-1 text-[9px] text-slate-400 font-bold uppercase">نصف القطر (r)</label>
                        </div>
                        <div className="text-xs text-slate-400 font-bold">المساحة = π × r²</div>
                      </div>
                    )}
                    {row.shape === 'trapezoid' && (
                      <>
                        <input type="number" step="0.1" value={row.dim1 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim1', parseFloat(e.target.value) || 0)} className="bg-white border border-slate-200 rounded-xl px-1 py-2 text-center text-[11px] font-bold outline-none" placeholder="قاعدة 1" />
                        <input type="number" step="0.1" value={row.dim2 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim2', parseFloat(e.target.value) || 0)} className="bg-white border border-slate-200 rounded-xl px-1 py-2 text-center text-[11px] font-bold outline-none" placeholder="قاعدة 2" />
                        <input type="number" step="0.1" value={row.dim3 || ''} onChange={(e) => handleUpdateRow(row.id, 'dim3', parseFloat(e.target.value) || 0)} className="bg-white border border-slate-200 rounded-xl px-1 py-2 text-center text-[11px] font-bold outline-none" placeholder="الارتفاع" />
                      </>
                    )}
                  </div>

                  {/* Row Total & Delete */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                    <span className="font-black text-slate-700 text-sm">{calculateRowArea(row).toFixed(1)} <small className="text-[10px] text-slate-400 font-normal">م²</small></span>
                    <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length === 1}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 disabled:hidden"
                    >
                        <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRow}
            className="mt-6 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all group"
          >
            <div className="bg-slate-100 group-hover:bg-primary-100 p-1 rounded-full transition-colors">
                <Icon name="plus" size={16} />
            </div>
            إضافة شكل هندسي جديد
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">المجموع النهائي</span>
                    <span className="block text-2xl font-black text-primary-700">{totalArea.toFixed(1)} م²</span>
                </div>
                {diff !== 0 && (
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${diff > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        <Icon name={diff > 0 ? 'plus' : 'minus'} size={10} />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl">إلغاء</button>
                <button onClick={handleApply} className="flex-1 sm:flex-none px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2">
                    <Icon name="check" size={18} />
                    اعتماد النتيجة
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};