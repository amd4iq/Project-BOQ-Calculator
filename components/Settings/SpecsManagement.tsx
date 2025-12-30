
import React, { useState } from 'react';
import { Category } from '../../types';
import { Icon } from '../Icons';
import { CategoryEditor } from '../CategoryEditor';
import { useAppSettings } from '../../contexts/AppSettingsContext';

export const SpecsManagement: React.FC = () => {
    const { settings, setSettings } = useAppSettings();
    const [activeSpecType, setActiveSpecType] = useState<'structure' | 'finishes'>('structure');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    if (!settings) return null;

    const categories = activeSpecType === 'structure' ? settings.structureCategories : settings.finishesCategories;

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsEditorOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsEditorOpen(true);
    };

    const handleSave = (category: Category) => {
        const key = activeSpecType === 'structure' ? 'structureCategories' : 'finishesCategories';
        const updatedCategories = categories.some(c => c.id === category.id)
            ? categories.map(c => c.id === category.id ? category : c)
            : [...categories, category];
        
        setSettings(prev => prev ? { ...prev, [key]: updatedCategories } : null);
        setIsEditorOpen(false);
    };

    const handleDelete = (categoryId: string) => {
        const key = activeSpecType === 'structure' ? 'structureCategories' : 'finishesCategories';
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        setSettings(prev => prev ? { ...prev, [key]: updatedCategories } : null);
        setIsEditorOpen(false);
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">إدارة المواصفات الفنية</h1>
                    <p className="text-slate-500 mt-1">تعديل القوائم والأسعار الافتراضية التي تظهر عند إنشاء عروض جديدة.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 active:scale-95"
                >
                    <Icon name="plus" size={18} />
                    إضافة قسم مواصفات
                </button>
            </header>

            <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveSpecType('structure')}
                    className={`flex items-center gap-2 justify-center py-2 px-4 rounded-xl font-bold text-sm transition-all ${activeSpecType === 'structure' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                    <Icon name="layers" size={16} />
                    عروض الهيكل
                </button>
                <button
                    onClick={() => setActiveSpecType('finishes')}
                    className={`flex items-center gap-2 justify-center py-2 px-4 rounded-xl font-bold text-sm transition-all ${activeSpecType === 'finishes' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                    <Icon name="paint" size={16} />
                    عروض الإنهاءات
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 border-b-2 border-slate-200">
                        <tr>
                            <th className="p-4 font-extrabold text-slate-600 text-right">اسم قسم المواصفات</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right">عدد الخيارات</th>
                            <th className="p-4 font-extrabold text-slate-600 text-center">اختيار متعدد</th>
                            <th className="p-4 font-extrabold text-slate-600 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                                    <Icon name={cat.iconName} size={16} className="text-slate-400" />
                                    {cat.title}
                                </td>
                                <td className="p-4 text-slate-600">{cat.options.length}</td>
                                <td className="p-4 text-center">
                                    {cat.allowMultiple && <Icon name="check-simple" size={18} className="text-emerald-500 mx-auto" />}
                                </td>
                                <td className="p-4 text-left">
                                    <button onClick={() => handleEdit(cat)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                        <Icon name="pencil" size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CategoryEditor 
                category={editingCategory}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSave}
                onLiveUpdate={() => {}} 
                onDelete={handleDelete}
                isReadOnly={false}
            />
        </div>
    );
};
