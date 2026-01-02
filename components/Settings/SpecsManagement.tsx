
import React, { useState, useMemo, useEffect } from 'react';
import { Category, StandardSpec, Option } from '../../core/types.ts';
import { Icon } from '../Icons.tsx';
import { CategoryEditor } from '../CategoryEditor.tsx';
import { useAppSettings } from '../../contexts/AppSettingsContext.tsx';
import { formatCurrency } from '../../core/utils/format.ts';

const OptionEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (option: Option) => void;
    option: Option | null;
}> = ({ isOpen, onClose, onSave, option }) => {
    const [label, setLabel] = useState('');
    const [cost, setCost] = useState('');

    useEffect(() => {
        if (option) {
            setLabel(option.label);
            setCost(String(option.cost));
        }
    }, [option]);

    if (!isOpen || !option) return null;

    const handleSave = () => {
        if (!label.trim()) return;
        onSave({
            ...option,
            label: label.trim(),
            cost: Number(cost) || 0,
        });
    };

    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">تعديل البند</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">اسم البند</label>
                        <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">السعر</label>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none" />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">إلغاء</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">حفظ التغييرات</button>
                </div>
            </div>
        </div>
    );
};

export const SpecsManagement: React.FC = () => {
    const { settings, setSettings } = useAppSettings();
    const [activeSpecType, setActiveSpecType] = useState<'structure' | 'finishes'>('structure');
    
    // State for Category Editor
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // State for Standard Specs inline editing
    const [quickAddText, setQuickAddText] = useState('');
    const [editingSpec, setEditingSpec] = useState<{ id: string, text: string } | null>(null);
    
    // State for Fixed Additions inline management
    const [quickAddLabel, setQuickAddLabel] = useState('');
    const [quickAddCost, setQuickAddCost] = useState('');
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<Option | null>(null);


    if (!settings) return null;

    const { categories, standardSpecs, fixedAdditions } = useMemo(() => {
        const isStructure = activeSpecType === 'structure';
        const allCategories = isStructure ? settings.structureCategories : settings.finishesCategories;
        return {
            categories: allCategories.filter(c => c.id !== 'fixed_additions'),
            standardSpecs: isStructure ? settings.structureStandardSpecs : settings.finishesStandardSpecs,
            fixedAdditions: allCategories.find(c => c.id === 'fixed_additions')
        };
    }, [activeSpecType, settings]);

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsEditorOpen(true);
    };

    const handleAddNewCategory = () => {
        setEditingCategory(null);
        setIsEditorOpen(true);
    };

    const handleSaveCategory = (category: Category) => {
        const key = activeSpecType === 'structure' ? 'structureCategories' : 'finishesCategories';
        const allCats = activeSpecType === 'structure' ? settings.structureCategories : settings.finishesCategories;
        const updatedCategories = allCats.some(c => c.id === category.id)
            ? allCats.map(c => c.id === category.id ? category : c)
            : [...allCats, category];
        
        setSettings(prev => prev ? { ...prev, [key]: updatedCategories } : null);
        setIsEditorOpen(false);
    };
    
    const handleDeleteCategory = (categoryId: string) => {
        const key = activeSpecType === 'structure' ? 'structureCategories' : 'finishesCategories';
        const allCats = activeSpecType === 'structure' ? settings.structureCategories : settings.finishesCategories;
        const updatedCategories = allCats.filter(c => c.id !== categoryId);
        setSettings(prev => prev ? { ...prev, [key]: updatedCategories } : null);
        setIsEditorOpen(false);
    };

    // --- Fixed Additions Handlers ---
    const handleUpdateFixedAdditionsCategory = (updatedCategory: Category) => {
        if (!settings) return;
        const key = activeSpecType === 'structure' ? 'structureCategories' : 'finishesCategories';
        const allCats = activeSpecType === 'structure' ? settings.structureCategories : settings.finishesCategories;
        const updatedCategories = allCats.map(c => c.id === 'fixed_additions' ? updatedCategory : c);
        setSettings(prev => prev ? { ...prev, [key]: updatedCategories } : null);
    };

    const handleQuickAddAddition = () => {
        if (!quickAddLabel.trim() || !fixedAdditions) return;
        const newOption: Option = {
            id: `opt-${Date.now()}`,
            label: quickAddLabel.trim(),
            cost: Number(quickAddCost) || 0,
            costType: 'fixed',
        };
        const updatedCategory = {
            ...fixedAdditions,
            options: [newOption, ...fixedAdditions.options],
        };
        handleUpdateFixedAdditionsCategory(updatedCategory);
        setQuickAddLabel('');
        setQuickAddCost('');
    };

    const handleDeleteAddition = (optionId: string) => {
        if (!fixedAdditions || !window.confirm('هل أنت متأكد من حذف هذا البند؟')) return;
        const updatedCategory = {
            ...fixedAdditions,
            options: fixedAdditions.options.filter(opt => opt.id !== optionId),
        };
        handleUpdateFixedAdditionsCategory(updatedCategory);
    };

    const handleOpenEditModal = (option: Option) => {
        setEditingOption(option);
        setIsOptionModalOpen(true);
    };

    const handleSaveOption = (updatedOption: Option) => {
        if (!fixedAdditions || !editingOption) return;
        const updatedCategory = {
            ...fixedAdditions,
            options: fixedAdditions.options.map(opt => opt.id === editingOption.id ? updatedOption : opt),
        };
        handleUpdateFixedAdditionsCategory(updatedCategory);
        setIsOptionModalOpen(false);
        setEditingOption(null);
    };

    // --- Standard Specs Handlers ---
    const handleAddStandardSpec = () => {
        if (!quickAddText.trim()) return;
        const key = activeSpecType === 'structure' ? 'structureStandardSpecs' : 'finishesStandardSpecs';
        const newSpec: StandardSpec = { id: `spec-${Date.now()}`, text: quickAddText.trim() };
        setSettings(prev => prev ? { ...prev, [key]: [...standardSpecs, newSpec] } : null);
        setQuickAddText('');
    };
    
    const handleUpdateStandardSpec = () => {
        if (!editingSpec) return;
        const key = activeSpecType === 'structure' ? 'structureStandardSpecs' : 'finishesStandardSpecs';
        const updatedSpecs = standardSpecs.map(s => s.id === editingSpec.id ? editingSpec : s);
        setSettings(prev => prev ? { ...prev, [key]: updatedSpecs } : null);
        setEditingSpec(null);
    };

    const handleDeleteStandardSpec = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المواصفة؟')) {
            const key = activeSpecType === 'structure' ? 'structureStandardSpecs' : 'finishesStandardSpecs';
            const updatedSpecs = standardSpecs.filter(s => s.id !== id);
            setSettings(prev => prev ? { ...prev, [key]: updatedSpecs } : null);
        }
    };
    
    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">إدارة المواصفات الفنية</h1>
                    <p className="text-slate-500 mt-1">تعديل القوائم والأسعار الافتراضية التي تظهر عند إنشاء عروض جديدة.</p>
                </div>
                <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <button onClick={() => setActiveSpecType('structure')} className={`flex items-center gap-2 justify-center py-2 px-4 rounded-xl font-bold text-sm transition-all ${activeSpecType === 'structure' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                        <Icon name="layers" size={16} /> عروض الهيكل
                    </button>
                    <button onClick={() => setActiveSpecType('finishes')} className={`flex items-center gap-2 justify-center py-2 px-4 rounded-xl font-bold text-sm transition-all ${activeSpecType === 'finishes' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                        <Icon name="paint" size={16} /> عروض الإنهاءات
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column: Variable & Fixed */}
                <div className="space-y-8">
                    {/* Variable Specs */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-800">المواصفات الفنية المتغيرة</h2>
                            <button onClick={handleAddNewCategory} className="flex items-center gap-1 text-xs font-bold bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100"><Icon name="plus" size={14}/> إضافة قسم</button>
                        </div>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Icon name={cat.iconName} size={18} className="text-slate-400"/>
                                        <span className="font-bold text-slate-700 text-sm">{cat.title}</span>
                                        <span className="text-xs text-slate-400 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">{cat.options.length} خيارات</span>
                                    </div>
                                    <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Icon name="pencil" size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Fixed Additions */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-lg text-slate-800 mb-4">قائمة الإضافات المقطوعة</h2>
                        <div className="flex gap-2 pb-4 mb-4 border-b border-slate-100">
                            <input type="text" value={quickAddLabel} onChange={(e) => setQuickAddLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAddAddition()} placeholder="اسم البند الجديد" className="flex-1 text-sm p-2 rounded-lg bg-slate-100 border border-slate-200 focus:border-indigo-400 outline-none" />
                            <input type="number" value={quickAddCost} onChange={(e) => setQuickAddCost(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAddAddition()} placeholder="السعر" className="w-28 text-sm p-2 rounded-lg bg-slate-100 border border-slate-200 focus:border-indigo-400 outline-none" />
                            <button onClick={handleQuickAddAddition} className="text-sm font-bold bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300" disabled={!quickAddLabel.trim()}>إضافة</button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {fixedAdditions && fixedAdditions.options.map(opt => (
                                <div key={opt.id} className="flex items-center justify-between p-2 pr-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{opt.label}</p>
                                        <p className="text-xs font-mono text-emerald-600 font-semibold">{formatCurrency(opt.cost)}</p>
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditModal(opt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Icon name="pencil" size={16} /></button>
                                        <button onClick={() => handleDeleteAddition(opt.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Icon name="trash" size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {(!fixedAdditions || fixedAdditions.options.length === 0) && (
                                <p className="text-center text-sm text-slate-400 py-4">لا توجد إضافات. استخدم النموذج أعلاه لإضافة أول بند.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Standard Specs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="font-bold text-lg text-slate-800 mb-4">المواصفات القياسية المشمولة</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {standardSpecs.map(spec => (
                             <div key={spec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                {editingSpec?.id === spec.id ? (
                                    <div className="space-y-2">
                                        <input type="text" value={editingSpec.text} onChange={e => setEditingSpec({ ...editingSpec, text: e.target.value })} className="w-full text-sm p-2 rounded-lg border border-primary-300 ring-2 ring-primary-100 outline-none"/>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingSpec(null)} className="text-xs font-bold px-3 py-1 hover:bg-slate-200 rounded-md">إلغاء</button>
                                            <button onClick={handleUpdateStandardSpec} className="text-xs font-bold px-3 py-1 bg-primary-600 text-white rounded-md">حفظ</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-sm text-slate-700 leading-relaxed flex-1">{spec.text}</p>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingSpec({ id: spec.id, text: spec.text })} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Icon name="pencil" size={14} /></button>
                                            <button onClick={() => handleDeleteStandardSpec(spec.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Icon name="trash" size={14} /></button>
                                        </div>
                                    </div>
                                )}
                             </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        <input type="text" value={quickAddText} onChange={e => setQuickAddText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddStandardSpec()} placeholder="إضافة مواصفة قياسية جديدة..." className="flex-1 w-full text-sm p-2 rounded-lg bg-slate-100 border border-slate-200 focus:border-primary-400 outline-none"/>
                        <button onClick={handleAddStandardSpec} className="text-sm font-bold bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-900">إضافة</button>
                    </div>
                </div>
            </div>

            <CategoryEditor 
                category={editingCategory}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveCategory}
                onLiveUpdate={() => {}} 
                onDelete={handleDeleteCategory}
                isReadOnly={false}
            />
            
            <OptionEditModal
                isOpen={isOptionModalOpen}
                onClose={() => setIsOptionModalOpen(false)}
                onSave={handleSaveOption}
                option={editingOption}
            />
        </div>
    );
};
