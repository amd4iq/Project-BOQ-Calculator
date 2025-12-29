
import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { AreaRow, AreaShape } from '../types';

interface AreaCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (totalArea: number, breakdown: AreaRow[]) => void;
  currentArea: number;
  savedBreakdown?: AreaRow[];
}

const AreaSection: React.FC<{
    title: string;
    description: string;
    unit: 'م²' | 'م';
    rows: AreaRow[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof AreaRow, value: any) => void;
    onRemove: (id: string) => void;
    calculateRowValue: (row: AreaRow) => number;
}> = ({ title, description, unit, rows, onAdd, onUpdate, onRemove, calculateRowValue }) => {
    const subtotal = rows.reduce((sum, row) => sum + calculateRowValue(row), 0);
    
    return (
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
                 <span className="font-black text-slate-700 text-lg bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{subtotal.toFixed(1)} <small className="text-xs text-slate-400 font-normal">م²</small></span>
            </div>
            <div className="space-y-2">
                {rows.map(row => (
                    <div key={row.id} className="grid grid-cols-12 gap-2 items-center group">
                        <input
                            type="text"
                            value={row.label}
                            onChange={(e) => onUpdate(row.id, 'label', e.target.value)}
                            placeholder="الوصف (مثال: سقف الأرضي)"
                            className="col-span-6 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:border-primary-400 outline-none transition-all text-sm"
                        />
                        <div className="col-span-5 relative">
                           <input
                            type="number"
                            step="0.1"
                            value={row.dim1 || ''}
                            onChange={(e) => onUpdate(row.id, 'dim1', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-center text-sm font-bold outline-none"
                            placeholder="القيمة"
                           />
                           <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">{unit}</span>
                        </div>
                        <div className="col-span-1 text-center">
                            <button
                                onClick={() => onRemove(row.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Icon name="trash" size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onAdd}
                className="mt-3 w-full text-xs font-bold text-slate-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
                <Icon name="plus" size={14}/>
                إضافة بند
            </button>
        </div>
    );
};

export const AreaCalculator: React.FC<AreaCalculatorProps> = ({ 
  isOpen, 
  onClose, 
  onApply,
  currentArea,
  savedBreakdown
}) => {
  const [rows, setRows] = useState<AreaRow[]>([]);

  const getInitialRows = () => [
      { id: 'full-1', label: 'سقف الطابق الأرضي', shape: 'full' as AreaShape, dim1: 170, dim2: 0, dim3: 0 },
      { id: 'full-2', label: 'سقف الطابق الأول', shape: 'full' as AreaShape, dim1: 170, dim2: 0, dim3: 0 },
      { id: 'half-1', label: 'الكراج', shape: 'half' as AreaShape, dim1: 30, dim2: 0, dim3: 0 },
      { id: 'half-2', label: 'البيتونة', shape: 'half' as AreaShape, dim1: 30, dim2: 0, dim3: 0 },
      { id: 'third-1', label: 'السياج الخارجي', shape: 'third' as AreaShape, dim1: 54, dim2: 0, dim3: 0 },
  ];
  
  useEffect(() => {
    if (isOpen) {
      if (savedBreakdown && savedBreakdown.length > 0) {
        setRows(savedBreakdown);
      } else {
        setRows(getInitialRows());
      }
    }
  }, [isOpen, savedBreakdown]);

  const handleAddRow = (shape: AreaShape) => {
    setRows([
      ...rows, 
      { id: Date.now().toString(), label: '', shape, dim1: 0, dim2: 0, dim3: 0 }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof AreaRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const calculateRowArea = (row: AreaRow): number => {
    switch (row.shape) {
      case 'full': return row.dim1;
      case 'half': return row.dim1 / 2;
      case 'third': return row.dim1 / 3;
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
  
  const fullAreaRows = rows.filter(r => r.shape === 'full');
  const halfAreaRows = rows.filter(r => r.shape === 'half');
  const thirdLengthRows = rows.filter(r => r.shape === 'third');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-lg shadow-primary-200">
              <Icon name="calculator" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">حاسبة ذرعة البناء</h2>
              <p className="text-sm text-slate-500">حساب المساحة الإجمالية وفقاً لقواعد الذرعة المعتمدة</p>
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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-4">
          <AreaSection
            title="السقوف والمساحات الكاملة"
            description="القاعدة: يتم احتساب مساحة السقوف والدرج بالكامل."
            unit="م²"
            rows={fullAreaRows}
            onAdd={() => handleAddRow('full')}
            onUpdate={handleUpdateRow}
            onRemove={handleRemoveRow}
            calculateRowValue={(r) => r.dim1}
          />
          <AreaSection
            title="المناور والكراجات والمماشي"
            description="القاعدة: يتم احتساب نصف مساحة هذه البنود."
            unit="م²"
            rows={halfAreaRows}
            onAdd={() => handleAddRow('half')}
            onUpdate={handleUpdateRow}
            onRemove={handleRemoveRow}
            calculateRowValue={(r) => r.dim1 / 2}
          />
          <AreaSection
            title="الستائر والأسيجة الخارجية"
            description="القاعدة: يتم احتساب ثلث الطول الخطي لهذه البنود."
            unit="م"
            rows={thirdLengthRows}
            onAdd={() => handleAddRow('third')}
            onUpdate={handleUpdateRow}
            onRemove={handleRemoveRow}
            calculateRowValue={(r) => r.dim1 / 3}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">ذرعة البناء النهائية</span>
                    <span className="block text-2xl font-black text-primary-700">{totalArea.toFixed(1)} م²</span>
                </div>
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
