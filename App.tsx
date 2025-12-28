import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES, DEFAULT_SELECTIONS, BASE_PRICE, DEFAULT_STANDARD_SPECS, DEFAULT_PAYMENT_SCHEDULE } from './constants';
import { OptionSelector } from './components/OptionSelector';
import { PriceBreakdown } from './components/PriceBreakdown';
import { PaymentSchedule } from './components/PaymentSchedule';
import { ProjectInfo } from './components/ProjectInfo';
import { CategoryEditor } from './components/CategoryEditor';
import { StandardSpecs } from './components/StandardSpecs';
import { QuoteSidebar } from './components/QuoteSidebar';
import { PrintSettings } from './components/PrintSettings';
import { FixedAdditionsTable } from './components/FixedAdditionsTable';
import { formatCurrency } from './utils/format';
import { calculateQuoteTotals } from './utils/calculations';
import { downloadCSV, downloadJSON } from './utils/export';
import { SelectionState, Category, ProjectDetails, StandardSpec, SavedQuote, GlobalState, PrintSettings as PrintSettingsType, PaymentStage, AreaRow } from './types';
import { Icon } from './components/Icons';

type TabType = 'standard' | 'technical' | 'additions';

const STORAGE_KEY_V2 = 'boq_calculator_v2';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultPrintSettings: PrintSettingsType = {
  showDetails: true,
  showFooter: true,
  notes: '',
  showLogo: true 
};

const defaultProjectDetails: ProjectDetails = {
  employeeName: '',
  customerName: '',
  projectName: '',
  customerNumber: '',
  date: new Date().toISOString().split('T')[0],
  areaSize: 200 
};

const createNewQuote = (): SavedQuote => ({
  id: generateId(),
  lastModified: Date.now(),
  categories: CATEGORIES,
  selections: DEFAULT_SELECTIONS,
  projectDetails: defaultProjectDetails,
  standardSpecs: DEFAULT_STANDARD_SPECS,
  printSettings: defaultPrintSettings,
  paymentSchedule: DEFAULT_PAYMENT_SCHEDULE,
  areaBreakdown: []
});

const App: React.FC = () => {
  const loadInitialState = (): GlobalState => {
    if (typeof window === 'undefined') {
      const initialQuote = createNewQuote();
      return { quotes: [initialQuote], currentQuoteId: initialQuote.id };
    }
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY_V2);
      if (saved) {
        return JSON.parse(saved);
      }
      const initialQuote = createNewQuote();
      return { quotes: [initialQuote], currentQuoteId: initialQuote.id };
    } catch (e) {
      const initialQuote = createNewQuote();
      return { quotes: [initialQuote], currentQuoteId: initialQuote.id };
    }
  };

  const [globalState, setGlobalState] = useState<GlobalState>(loadInitialState);
  
  const currentQuote = useMemo(() => {
    return globalState.quotes.find(q => q.id === globalState.currentQuoteId) || globalState.quotes[0];
  }, [globalState]);

  const { grandTotal } = calculateQuoteTotals(
      currentQuote.categories,
      currentQuote.selections,
      currentQuote.projectDetails.areaSize
  );

  const [activeTab, setActiveTab] = useState<TabType>('technical');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(globalState));
  }, [globalState]);

  const updateCurrentQuote = (updater: (quote: SavedQuote) => SavedQuote) => {
    setGlobalState(prev => ({
      ...prev,
      quotes: prev.quotes.map(q => q.id === prev.currentQuoteId ? { ...updater(q), lastModified: Date.now() } : q)
    }));
  };

  const handleCreateQuote = () => {
    const newQuote = createNewQuote();
    setGlobalState(prev => ({
      ...prev,
      quotes: [newQuote, ...prev.quotes],
      currentQuoteId: newQuote.id
    }));
  };

  const handleDuplicateQuote = (id: string) => {
    const source = globalState.quotes.find(q => q.id === id);
    if(source) {
       const newQuote = {
         ...source,
         id: generateId(),
         projectDetails: { ...source.projectDetails, projectName: `${source.projectDetails.projectName} (نسخة)`},
         lastModified: Date.now()
       };
       setGlobalState(prev => ({
         ...prev,
         quotes: [newQuote, ...prev.quotes],
         currentQuoteId: newQuote.id
       }));
    }
  };

  const handleDeleteQuote = (id: string) => {
    if (globalState.quotes.length <= 1) return;
    if(!window.confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    setGlobalState(prev => {
      const newQuotes = prev.quotes.filter(q => q.id !== id);
      const nextId = prev.currentQuoteId === id ? newQuotes[0].id : prev.currentQuoteId;
      return { ...prev, quotes: newQuotes, currentQuoteId: nextId };
    });
  };

  const handleSelection = (categoryId: string, optionId: string) => {
    updateCurrentQuote(q => {
      const category = q.categories.find(c => c.id === categoryId);
      const isMulti = category?.allowMultiple;
      let newValue: string | string[];

      if (isMulti) {
        const current = q.selections[categoryId];
        const currentArray = Array.isArray(current) ? current : (current ? [current] : []);
        newValue = currentArray.includes(optionId) ? currentArray.filter(id => id !== optionId) : [...currentArray, optionId];
      } else newValue = optionId;

      return { ...q, selections: { ...q.selections, [categoryId]: newValue } };
    });
  };

  const handleProjectDetailsChange = (field: keyof ProjectDetails, value: any) => {
    updateCurrentQuote(q => ({ ...q, projectDetails: { ...q.projectDetails, [field]: value } }));
  };

  const handleUpdateBreakdown = (breakdown: AreaRow[]) => {
    updateCurrentQuote(q => ({ ...q, areaBreakdown: breakdown }));
  };

  const handlePrintSettingsChange = (settings: PrintSettingsType) => {
    updateCurrentQuote(q => ({ ...q, printSettings: settings }));
  };

  const handlePaymentScheduleChange = (schedule: PaymentStage[]) => {
      updateCurrentQuote(q => ({ ...q, paymentSchedule: schedule }));
  };

  const handleStandardSpecAdd = (text: string) => {
    updateCurrentQuote(q => ({ ...q, standardSpecs: [...q.standardSpecs, { id: generateId(), text }] }));
  };

  const handleStandardSpecDelete = (id: string) => {
    updateCurrentQuote(q => ({ ...q, standardSpecs: q.standardSpecs.filter(s => s.id !== id) }));
  };
  
  const handleStandardSpecUpdate = (id: string, text: string) => {
      updateCurrentQuote(q => ({ ...q, standardSpecs: q.standardSpecs.map(s => s.id === id ? { ...s, text } : s) }));
  };

  const handleSaveCategory = (category: Category) => {
    updateCurrentQuote(q => {
      const exists = q.categories.find(c => c.id === category.id);
      let newCategories = exists ? q.categories.map(c => c.id === category.id ? category : c) : [...q.categories, category];
      let newSelections = { ...q.selections };
      if (!exists && category.options.length > 0) {
          newSelections[category.id] = category.allowMultiple ? [] : category.options[0].id;
      }
      return { ...q, categories: newCategories, selections: newSelections };
    });
    setIsEditorOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    updateCurrentQuote(q => {
      const newSelections = { ...q.selections };
      delete newSelections[categoryId];
      return { ...q, categories: q.categories.filter(c => c.id !== categoryId), selections: newSelections };
    });
    setIsEditorOpen(false);
  };

  const technicalCategories = currentQuote.categories.filter(c => c.id !== 'fixed_additions');
  const additionCategory = currentQuote.categories.find(c => c.id === 'fixed_additions');

  return (
    <div className="min-h-screen pb-20 print:pb-0 bg-slate-50/50">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden shadow-sm">
        <div className="max-w-[95rem] mx-auto px-8 sm:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><Icon name="menu" size={24} /></button>
             <div className="flex items-center gap-2">
                <div className="bg-primary-600 text-white p-1.5 rounded-lg"><Icon name="calculator" size={20} /></div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 hidden sm:block">معالم بغداد</h1>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPrintSettingsOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"><Icon name="printer" size={18} /><span>طباعة / PDF</span></button>
          </div>
        </div>
      </nav>

      <main className="max-w-[95rem] mx-auto px-8 sm:px-16 lg:px-24 py-6 print:p-0">
        
        <ProjectInfo 
          details={currentQuote.projectDetails} 
          onChange={handleProjectDetailsChange} 
          onUpdateBreakdown={handleUpdateBreakdown}
          savedBreakdown={currentQuote.areaBreakdown}
        />

        <div className="mb-8 print:hidden">
            <div className="flex flex-col sm:flex-row p-1 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm">
              {['technical', 'additions', 'standard'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as TabType)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === t ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Icon name={t === 'technical' ? 'settings' : t === 'additions' ? 'package' : 'check'} size={16} />
                  {t === 'technical' ? 'المواصفات الفنية' : t === 'additions' ? 'إضافات مقطوعة' : 'المواصفات الأساسية'}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-300">
                {activeTab === 'technical' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {technicalCategories.map((category) => (
                      <OptionSelector key={category.id} category={category} selectedOptionId={currentQuote.selections[category.id]} onSelect={handleSelection} onEdit={() => { setEditingCategory(category); setIsEditorOpen(true); }} />
                      ))}
                      <button onClick={() => { setEditingCategory(null); setIsEditorOpen(true); }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50/30 transition-all min-h-[200px]"><Icon name="plus" size={32} className="text-slate-300 mb-2" /><span className="font-bold text-slate-500">إضافة مواصفة جديدة</span></button>
                  </div>
                )}
                {activeTab === 'additions' && additionCategory && (
                   <FixedAdditionsTable category={additionCategory} selectedIds={Array.isArray(currentQuote.selections[additionCategory.id]) ? (currentQuote.selections[additionCategory.id] as string[]) : []} onSelect={handleSelection} onEditCategory={(c) => { setEditingCategory(c); setIsEditorOpen(true); }} onUpdateCategory={handleSaveCategory} />
                )}
                {activeTab === 'standard' && <StandardSpecs specs={currentQuote.standardSpecs} onAdd={handleStandardSpecAdd} onDelete={handleStandardSpecDelete} onUpdate={handleStandardSpecUpdate} />}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
          <PriceBreakdown categories={currentQuote.categories} selections={currentQuote.selections} areaSize={currentQuote.projectDetails.areaSize} showIndividualPrices={currentQuote.printSettings.showDetails} />
          <PaymentSchedule schedule={currentQuote.paymentSchedule || DEFAULT_PAYMENT_SCHEDULE} totalAmount={grandTotal} onChange={handlePaymentScheduleChange} />
        </div>
      </main>

      <QuoteSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} quotes={globalState.quotes} currentQuoteId={globalState.currentQuoteId} onSelectQuote={(id) => setGlobalState(prev => ({ ...prev, currentQuoteId: id }))} onNewQuote={handleCreateQuote} onDeleteQuote={handleDeleteQuote} onDuplicateQuote={handleDuplicateQuote} />
      <CategoryEditor isOpen={isEditorOpen} category={editingCategory} onClose={() => setIsEditorOpen(false)} onSave={handleSaveCategory} onLiveUpdate={() => {}} onDelete={handleDeleteCategory} />
      <PrintSettings isOpen={isPrintSettingsOpen} onClose={() => setIsPrintSettingsOpen(false)} settings={currentQuote.printSettings} onChange={handlePrintSettingsChange} />
    </div>
  );
};

export default App;