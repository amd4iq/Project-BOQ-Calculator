import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  QuoteType, 
  SavedQuote, 
  SelectionState, 
  Category, 
  ProjectDetails, 
  AreaRow, 
  Space, 
  StandardSpec, 
  PrintSettings as PrintSettingsType,
  PaymentStage,
  QuoteTemplate
} from './types';
import { getConstantsForQuoteType } from './constants';
import { calculateQuoteTotals } from './utils/calculations';
import { downloadJSON, downloadCSV } from './utils/export';

// Components
import { QuoteTypeSelector } from './components/QuoteTypeSelector';
import { QuoteSidebar } from './components/QuoteSidebar';
import { ProjectInfo } from './components/ProjectInfo';
import { TechnicalSpecsTable } from './components/TechnicalSpecsTable';
import { PriceBreakdown } from './components/PriceBreakdown';
import { PaymentSchedule } from './components/PaymentSchedule';
import { FixedAdditionsTable } from './components/FixedAdditionsTable';
import { StandardSpecs } from './components/StandardSpecs';
import { PrintSettings } from './components/PrintSettings';
import { CategoryEditor } from './components/CategoryEditor';
import { TemplateManager } from './components/TemplateManager';
import { Icon } from './components/Icons';

const LOCAL_STORAGE_KEY = 'construction_quotes_v1';

/**
 * Main Application Component
 * Manages the state of construction quotes, handling creation, selection, 
 * and updates of project specifications and pricing.
 */
const App: React.FC = () => {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'technical' | 'additions' | 'standard'>('technical');
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Load quotes from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.quotes) setQuotes(parsed.quotes);
        if (parsed.currentQuoteId) setCurrentQuoteId(parsed.currentQuoteId);
        if (parsed.templates) setTemplates(parsed.templates);
      } catch (e) {
        console.error("Failed to parse saved quotes", e);
      }
    }
  }, []);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ quotes, currentQuoteId, templates }));
  }, [quotes, currentQuoteId, templates]);

  const currentQuote = useMemo(() => quotes.find(q => q.id === currentQuoteId), [quotes, currentQuoteId]);

  // Handle new quote creation
  const handleCreateQuote = useCallback((type: QuoteType) => {
    const constants = getConstantsForQuoteType(type);
    const isFinishes = type === 'finishes';

    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      lastModified: Date.now(),
      quoteType: type,
      isPinned: false,
      categories: constants.CATEGORIES,
      selections: constants.DEFAULT_SELECTIONS,
      projectDetails: {
        employeeName: '',
        customerName: '',
        projectName: '',
        date: new Date().toISOString().split('T')[0],
        customerNumber: '',
        areaSize: 1,
        numberOfFloors: 1,
        spaces: [], // Simplified: calculation logic now derives spaces from levels
        basePricePerM2: constants.BASE_PRICE,
        enableBudgeting: false,
        targetBudget: 0,
        activeLevels: isFinishes ? [] : undefined,
      },
      standardSpecs: constants.DEFAULT_STANDARD_SPECS,
      printSettings: {
        showDetails: true,
        showFooter: true,
        notes: '',
        showLogo: false
      },
      paymentSchedule: constants.DEFAULT_PAYMENT_SCHEDULE,
      areaBreakdown: []
    };
    setQuotes(prev => [...prev, newQuote]);
    setCurrentQuoteId(newQuote.id);
  }, []);

  // Update logic for the current quote
  const updateCurrentQuote = useCallback((updates: Partial<SavedQuote>) => {
    if (!currentQuoteId) return;
    setQuotes(prev => prev.map(q => 
      q.id === currentQuoteId 
        ? { ...q, ...updates, lastModified: Date.now() } 
        : q
    ));
  }, [currentQuoteId]);

  const handleGoToWelcome = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في العودة إلى الشاشة الرئيسية؟ سيتم حفظ أي تغييرات ولكن ستحتاج إلى تحديد عرض سعر للمتابعة.')) {
      setCurrentQuoteId(null);
    }
  };

  const handleSelection = useCallback((categoryId: string, newSelection: any) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      selections: { ...currentQuote.selections, [categoryId]: newSelection }
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleProjectDetailChange = useCallback((field: keyof ProjectDetails, value: any) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      projectDetails: { ...currentQuote.projectDetails, [field]: value }
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleUpdateBreakdown = useCallback((breakdown: AreaRow[]) => {
    updateCurrentQuote({ areaBreakdown: breakdown });
  }, [updateCurrentQuote]);

  const handleUpdateSpaces = useCallback((spaces: Space[]) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      projectDetails: { ...currentQuote.projectDetails, spaces }
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleUpdateStandardSpecs = useCallback((id: string, newText: string) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      standardSpecs: currentQuote.standardSpecs.map(s => s.id === id ? { ...s, text: newText } : s)
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleAddStandardSpec = useCallback((text: string) => {
    if (!currentQuote) return;
    const newSpec: StandardSpec = { id: Date.now().toString(), text };
    updateCurrentQuote({
      standardSpecs: [...currentQuote.standardSpecs, newSpec]
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleDeleteStandardSpec = useCallback((id: string) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      standardSpecs: currentQuote.standardSpecs.filter(s => s.id !== id)
    });
  }, [currentQuote, updateCurrentQuote]);

  const handleUpdatePaymentSchedule = useCallback((schedule: PaymentStage[]) => {
    updateCurrentQuote({ paymentSchedule: schedule });
  }, [updateCurrentQuote]);

  const handleSaveCategory = useCallback((category: Category) => {
    if (!currentQuote) return;
    const exists = currentQuote.categories.some(c => c.id === category.id);
    let newCategories;
    if (exists) {
      newCategories = currentQuote.categories.map(c => c.id === category.id ? category : c);
    } else {
      newCategories = [...currentQuote.categories, category];
    }
    updateCurrentQuote({ categories: newCategories });
    setIsEditorOpen(false);
  }, [currentQuote, updateCurrentQuote]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (!currentQuote) return;
    updateCurrentQuote({
      categories: currentQuote.categories.filter(c => c.id !== categoryId)
    });
    setIsEditorOpen(false);
  }, [currentQuote, updateCurrentQuote]);

  const handleDuplicateQuote = useCallback((id: string) => {
    const quoteToDup = quotes.find(q => q.id === id);
    if (!quoteToDup) return;
    const newQuote: SavedQuote = {
      ...quoteToDup,
      id: Date.now().toString(),
      lastModified: Date.now(),
      projectDetails: { ...quoteToDup.projectDetails, projectName: `${quoteToDup.projectDetails.projectName} (نسخة)` }
    };
    setQuotes(prev => [...prev, newQuote]);
  }, [quotes]);

  const handleTogglePin = useCallback((id: string) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, isPinned: !q.isPinned } : q));
  }, []);

  const handleRenameQuote = useCallback((id: string, newName: string) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, projectDetails: { ...q.projectDetails, projectName: newName } } : q));
  }, []);

  const handleDeleteQuote = useCallback((id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    if (currentQuoteId === id) setCurrentQuoteId(null);
  }, [currentQuoteId]);

  // Template Handlers
  const handleSaveTemplate = useCallback((name: string) => {
    if (!currentQuote) return;
    const newTemplate: QuoteTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      selections: currentQuote.selections,
    };
    setTemplates(prev => [...prev, newTemplate]);
  }, [currentQuote]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateCurrentQuote({ selections: template.selections });
      setIsTemplateManagerOpen(false);
    }
  }, [templates, updateCurrentQuote]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  // Calculate financials
  const quoteTotals = useMemo(() => {
    if (!currentQuote) return null;
    return calculateQuoteTotals(
      currentQuote.categories,
      currentQuote.selections,
      currentQuote.projectDetails,
      currentQuote.quoteType
    );
  }, [currentQuote]);

  // Define tabs based on quote type
  const TABS = useMemo(() => {
    const commonTabs = [
        { id: 'technical', label: 'المواصفات الفنية', icon: 'settings' },
        { id: 'additions', label: 'الاضافات بسعر ثابت', icon: 'package' },
    ];
    if (currentQuote?.quoteType === 'structure') {
        return [
            ...commonTabs,
            { id: 'standard', label: 'المواصفات الاساسية', icon: 'check' }
        ];
    }
    return commonTabs;
  }, [currentQuote?.quoteType]);

  // Effect to reset active tab if it becomes invalid for the current quote type
  useEffect(() => {
    if (currentQuote?.quoteType === 'finishes' && activeTab === 'standard') {
        setActiveTab('technical');
    }
  }, [currentQuote?.quoteType, activeTab]);

  // If no quote is selected or found, show the type selector
  if (!currentQuote) {
    return <QuoteTypeSelector onSelect={handleCreateQuote} />;
  }

  const technicalCategories = currentQuote.categories.filter(c => c.id !== 'fixed_additions');
  const fixedAdditionsCategory = currentQuote.categories.find(c => c.id === 'fixed_additions');

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900" dir="rtl">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <Icon name="menu" size={24} />
          </button>
          <button onClick={handleGoToWelcome} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="العودة إلى الشاشة الرئيسية">
            <Icon name="rotate-ccw" size={20} />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 leading-tight">معالم بغداد للمقاولات</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentQuote.quoteType === 'structure' ? 'عرض بناء هيكل' : 'عرض إنهاءات'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => setIsTemplateManagerOpen(true)}
                className="bg-white text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 border border-slate-200 transition-all shadow-sm flex items-center gap-2"
              >
                <Icon name="template" size={18} />
                القوالب
              </button>
            <button 
                onClick={() => setIsPrintSettingsOpen(true)}
                className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95"
            >
                <Icon name="printer" size={18} />
                طباعة العرض
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button 
                onClick={() => downloadJSON(currentQuote, `Quote-${currentQuote.projectDetails.projectName || 'New'}`)}
                className="p-2.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                title="تصدير JSON"
            >
                <Icon name="json" size={20} />
            </button>
            <button 
                onClick={() => downloadCSV(currentQuote, quoteTotals?.finalPricePerM2 || 0, quoteTotals?.grandTotal || 0)}
                className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="تصدير CSV"
            >
                <Icon name="spreadsheet" size={20} />
            </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Project Header Info */}
        <ProjectInfo 
            details={currentQuote.projectDetails}
            quoteType={currentQuote.quoteType}
            onChange={handleProjectDetailChange}
            onUpdateBreakdown={handleUpdateBreakdown}
            onUpdateSpaces={handleUpdateSpaces}
            savedBreakdown={currentQuote.areaBreakdown}
            quoteTotals={quoteTotals}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        flex items-center gap-2 flex-1 justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all
                        ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                    `}
                >
                    <Icon name={tab.icon} size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="mb-8 min-h-[300px]">
            {activeTab === 'technical' && (
                <div className="animate-in fade-in duration-500">
                    <TechnicalSpecsTable
                        categories={technicalCategories}
                        selections={currentQuote.selections}
                        onSelect={handleSelection}
                        onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }}
                        onNewCategory={() => { setEditingCategory(null); setIsEditorOpen(true); }}
                        projectDetails={currentQuote.projectDetails}
                        quoteType={currentQuote.quoteType}
                    />
                </div>
            )}
            
            {activeTab === 'additions' && fixedAdditionsCategory && (
                <div className="animate-in fade-in duration-500">
                    <FixedAdditionsTable 
                        category={fixedAdditionsCategory}
                        selectedIds={(currentQuote.selections.fixed_additions as string[]) || []}
                        onSelect={(catId, optId) => {
                            const current = (currentQuote.selections.fixed_additions as string[]) || [];
                            const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId];
                            handleSelection(catId, next);
                        }}
                        onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }}
                        onUpdateCategory={(cat) => {
                            const nextCats = currentQuote.categories.map(c => c.id === cat.id ? cat : c);
                            updateCurrentQuote({ categories: nextCats });
                        }}
                    />
                </div>
            )}

            {activeTab === 'standard' && (
                <div className="animate-in fade-in duration-500">
                    <StandardSpecs 
                        specs={currentQuote.standardSpecs}
                        onAdd={handleAddStandardSpec}
                        onDelete={handleDeleteStandardSpec}
                        onUpdate={handleUpdateStandardSpecs}
                    />
                </div>
            )}
        </div>
        
        {/* Financial Section */}
        {quoteTotals && (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <PriceBreakdown 
                        categories={currentQuote.categories}
                        selections={currentQuote.selections}
                        projectDetails={currentQuote.projectDetails}
                        showIndividualPrices={currentQuote.printSettings.showDetails}
                        quoteTotals={quoteTotals}
                        quoteType={currentQuote.quoteType}
                        onBasePriceChange={(val) => handleProjectDetailChange('basePricePerM2', val)}
                    />
                </div>
                <div className="lg:col-span-3">
                     <PaymentSchedule 
                        schedule={currentQuote.paymentSchedule || []}
                        totalAmount={quoteTotals.grandTotal}
                        onChange={handleUpdatePaymentSchedule}
                    />
                </div>
            </div>
        )}
      </main>

      {/* Sidebar for Quote Management */}
      <QuoteSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        quotes={quotes}
        currentQuoteId={currentQuoteId}
        onSelectQuote={(id) => setCurrentQuoteId(id)}
        onNewQuote={() => setCurrentQuoteId(null)}
        onDeleteQuote={handleDeleteQuote}
        onDuplicateQuote={handleDuplicateQuote}
        onTogglePin={handleTogglePin}
        onRenameQuote={handleRenameQuote}
      />

      {/* Print Settings Modal */}
      <PrintSettings 
        isOpen={isPrintSettingsOpen}
        onClose={() => setIsPrintSettingsOpen(false)}
        settings={currentQuote.printSettings}
        onChange={(settings) => updateCurrentQuote({ printSettings: settings })}
      />

      {/* Category Editor Modal */}
      <CategoryEditor 
        category={editingCategory}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveCategory}
        onLiveUpdate={() => {}} 
        onDelete={handleDeleteCategory}
      />
      
      {/* Template Manager Modal */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        templates={templates}
        onSave={handleSaveTemplate}
        onApply={handleApplyTemplate}
        onDelete={handleDeleteTemplate}
      />
    </div>
  );
};

export default App;