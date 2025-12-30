
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Category, ProjectDetails, AreaRow, StandardSpec, PaymentStage } from '../types';
import { useAuth } from './Auth/AuthContext';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useQuote } from '../contexts/QuoteContext';
import { calculateQuoteTotals } from '../utils/calculations';
import { downloadJSON, downloadCSV } from '../utils/export';

// Components
import { QuoteSidebar } from './QuoteSidebar';
import { ProjectInfo } from './ProjectInfo';
import { TechnicalSpecsTable } from './TechnicalSpecsTable';
import { PriceBreakdown } from './PriceBreakdown';
import { PaymentSchedule } from './PaymentSchedule';
import { FixedAdditionsTable } from './FixedAdditionsTable';
import { PrintSettings } from './PrintSettings';
import { CategoryEditor } from './CategoryEditor';
import { Icon } from './Icons';
import { StandardSpecs } from './ConstructionOffers/StandardSpecs';
import { ConfirmationModal } from './ConfirmationModal';
import { SaveTemplateModal } from './SaveTemplateModal';
import { PrintController } from '../PrintEngine/PrintController';
import { PrintConfirmationModal } from './PrintConfirmationModal';

interface WorkspaceProps {
  setViewMode: (mode: 'workspace' | 'archive' | 'settings') => void;
  handleGoToWelcome: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ setViewMode, handleGoToWelcome }) => {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const { 
    currentQuote, 
    updateCurrentQuote, 
    isReadOnly, 
    canEditSpecs,
    quotes,
    templates,
    handleDeleteQuote,
    handleDuplicateQuote,
    handleTogglePin,
    handleRenameQuote,
    handleSaveTemplate,
    handleApplyTemplate,
    handleDeleteTemplate,
    handleSelectQuote,
    updateQuoteStatus
  } = useQuote();

  const [activeTab, setActiveTab] = useState<'technical' | 'additions' | 'standard'>('technical');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  
  useEffect(() => {
    if (currentQuote?.quoteType === 'finishes' && activeTab === 'standard') {
        setActiveTab('technical');
    }
  }, [currentQuote?.quoteType, activeTab]);

  const quoteTotals = useMemo(() => {
    if (!currentQuote) return null;
    return calculateQuoteTotals(
      currentQuote.categories,
      currentQuote.selections,
      currentQuote.projectDetails,
      currentQuote.quoteType
    );
  }, [currentQuote]);

  const handleApproveAndPrint = useCallback(() => {
    if (!currentQuote || !auth.currentUser) return;
    setIsPrintConfirmationOpen(false); // Close confirmation modal first
    const now = Date.now();
    updateQuoteStatus(currentQuote.id, 'Printed - Pending Client Approval', {
        approvedAt: now,
        printedAt: now,
        validUntil: now + (14 * 24 * 60 * 60 * 1000),
        printLog: [...(currentQuote.printLog || []), { printedBy: auth.currentUser.displayName || auth.currentUser.name, printedAt: now, version: currentQuote.version }],
    });
    setTimeout(() => window.print(), 300);
    setTimeout(() => setIsConfirmationModalOpen(true), 10000);
  }, [currentQuote, updateQuoteStatus, auth.currentUser]);

  const handleSelection = useCallback((categoryId: string, newSelection: any) => {
    if (!currentQuote) return;
    updateCurrentQuote({ selections: { ...currentQuote.selections, [categoryId]: newSelection } });
  }, [currentQuote, updateCurrentQuote]);

  const handleProjectDetailChange = useCallback((field: keyof ProjectDetails, value: any) => {
    if (!currentQuote) return;
    updateCurrentQuote({ projectDetails: { ...currentQuote.projectDetails, [field]: value } });
  }, [currentQuote, updateCurrentQuote]);
  
  const handleOpenSaveTemplateModal = () => {
    if (!currentQuote || isReadOnly) return;
    setIsSaveTemplateModalOpen(true);
  };

  const handleConfirmSaveTemplate = useCallback((templateName: string) => {
    const existingNames = templates.map(t => t.name);
    let finalName = templateName;
    let counter = 1;
    while (existingNames.includes(finalName)) {
        finalName = `${templateName} (${counter})`;
        counter++;
    }
    handleSaveTemplate(finalName);
    setIsSaveTemplateModalOpen(false);
  }, [templates, handleSaveTemplate]);

  if (!currentQuote || !auth.currentUser || !settings) return null;

  const technicalCategories = currentQuote.categories.filter(c => c.id !== 'fixed_additions');
  const fixedAdditionsCategory = currentQuote.categories.find(c => c.id === 'fixed_additions');
  
  const TABS = useMemo(() => {
    const commonTabs = [
        { id: 'technical', label: 'المواصفات الفنية', icon: 'settings' },
        { id: 'additions', label: 'الاضافات بسعر ثابت', icon: 'package' },
    ];
    if (currentQuote?.quoteType === 'structure') {
        return [ ...commonTabs, { id: 'standard', label: 'المواصفات الاساسية', icon: 'check' } ];
    }
    return commonTabs;
  }, [currentQuote?.quoteType]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900" dir="rtl">
      <PrintController quote={currentQuote} totals={quoteTotals} companyInfo={settings.companyInfo} />
      
      <nav className="bg-white border-b border-slate-200 px-6 h-20 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
              <button
                  onClick={handleGoToWelcome}
                  title="الصفحة الرئيسية"
                  className="p-3 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 rounded-xl transition-all"
              >
                  <Icon name="home" size={20} />
              </button>
              <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  title="إدارة المشاريع"
                  className="p-3 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 rounded-xl transition-all"
              >
                  <Icon name="layers" size={20} />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div>
                  <h1 className="text-xl font-black text-slate-800 leading-tight">
                      {currentQuote.projectDetails.projectName || 'مشروع جديد'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                      {currentQuote.quoteType === 'structure' ? 'عرض بناء هيكل' : 'عرض إنهاءات'}
                      <span className="mx-1.5 text-slate-300">•</span>
                      V{currentQuote.version}
                  </p>
              </div>
          </div>

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
              <button
                  onClick={() => setIsPrintConfirmationOpen(true)}
                  disabled={isReadOnly}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                  <Icon name="printer" size={18} />
                  <span>اعتماد وطباعة</span>
              </button>
              
              <div className="flex items-center gap-2">
                  <button
                      onClick={() => setViewMode('archive')}
                      className="flex items-center gap-1.5 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                  >
                      <Icon name="archive" size={16} />
                      <span>الأرشيف</span>
                  </button>
                  <div className="flex items-center bg-slate-100/80 border border-slate-200/80 rounded-lg p-1">
                      <button onClick={() => downloadJSON(currentQuote, `Quote-${currentQuote.projectDetails.projectName || 'New'}`)} title="تصدير JSON" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-colors">
                          <Icon name="json" size={16} />
                      </button>
                      <button onClick={() => quoteTotals && downloadCSV(currentQuote, quoteTotals.finalPricePerM2, quoteTotals.grandTotal)} title="تصدير CSV" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-colors">
                          <Icon name="spreadsheet" size={16} />
                      </button>
                  </div>
              </div>
              
              <div className="h-8 w-px bg-slate-200"></div>

              <div className="relative group">
                  <button className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200/80">
                      <Icon name="user" size={16} />
                      <span>{auth.currentUser.displayName || auth.currentUser.name}</span>
                      <Icon name="chevron" size={14} className="text-slate-400 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
                      <button onClick={() => setViewMode('settings')} className="w-full text-right flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700">
                          <Icon name="settings" size={16}/>الإعدادات
                      </button>
                      <div className="my-1 h-px bg-slate-100"></div>
                      <button onClick={auth.logout} className="w-full text-right flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 text-rose-600">
                          <Icon name="log-out" size={16}/>تسجيل الخروج
                      </button>
                  </div>
              </div>
          </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
         {isReadOnly && (
            <div className="mb-6 p-4 bg-amber-50 text-amber-800 border-2 border-dashed border-amber-200 rounded-2xl flex items-center gap-3">
                <Icon name="archive" size={24} className="text-amber-600" />
                <div>
                    <h3 className="font-bold">هذا عرض مؤرشف وهو للقراءة فقط.</h3>
                    <p className="text-sm">لا يمكن تعديل هذا العرض لأن حالته هي "{currentQuote.status}". للتعديل، يجب على المدير فتح قفل العرض.</p>
                </div>
            </div>
        )}
        <ProjectInfo 
            details={currentQuote.projectDetails}
            quoteType={currentQuote.quoteType}
            onChange={handleProjectDetailChange}
            onUpdateBreakdown={(breakdown: AreaRow[]) => updateCurrentQuote({ areaBreakdown: breakdown })}
            savedBreakdown={currentQuote.areaBreakdown}
            quoteTotals={quoteTotals}
            isReadOnly={isReadOnly}
        />

        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 flex-1 justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <Icon name={tab.icon} size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="mb-8 min-h-[300px]">
            {activeTab === 'technical' && (
                <div className="animate-in fade-in duration-500">
                    <TechnicalSpecsTable categories={technicalCategories} selections={currentQuote.selections} onSelect={handleSelection} onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }} onNewCategory={() => { setEditingCategory(null); setIsEditorOpen(true); }} projectDetails={currentQuote.projectDetails} quoteType={currentQuote.quoteType} isReadOnly={isReadOnly} />
                </div>
            )}
            
            {activeTab === 'additions' && fixedAdditionsCategory && (
                <div className="animate-in fade-in duration-500">
                    <FixedAdditionsTable category={fixedAdditionsCategory} selectedIds={(currentQuote.selections.fixed_additions as string[]) || []} onSelect={(catId, optId) => { const current = (currentQuote.selections.fixed_additions as string[]) || []; const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId]; handleSelection(catId, next); }} onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }} onUpdateCategory={(cat) => { const nextCats = currentQuote.categories.map(c => c.id === cat.id ? cat : c); updateCurrentQuote({ categories: nextCats }); }} isReadOnly={isReadOnly} canEdit={canEditSpecs} />
                </div>
            )}

            {activeTab === 'standard' && (
                <div className="animate-in fade-in duration-500">
                    <StandardSpecs specs={currentQuote.standardSpecs} onAdd={(text: string) => updateCurrentQuote({ standardSpecs: [...currentQuote.standardSpecs, { id: Date.now().toString(), text }] })} onDelete={(id: string) => updateCurrentQuote({ standardSpecs: currentQuote.standardSpecs.filter(s => s.id !== id) })} onUpdate={(id: string, newText: string) => updateCurrentQuote({ standardSpecs: currentQuote.standardSpecs.map(s => s.id === id ? { ...s, text: newText } : s) })} isReadOnly={isReadOnly} />
                </div>
            )}
        </div>
        
        {quoteTotals && (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2"> <PriceBreakdown categories={currentQuote.categories} selections={currentQuote.selections} projectDetails={currentQuote.projectDetails} showIndividualPrices={currentQuote.printSettings.showDetails} quoteTotals={quoteTotals} quoteType={currentQuote.quoteType} onBasePriceChange={(val) => handleProjectDetailChange('basePricePerM2', val)} isReadOnly={isReadOnly} /> </div>
                <div className="lg:col-span-3"> <PaymentSchedule schedule={currentQuote.paymentSchedule || []} totalAmount={quoteTotals.grandTotal} onChange={(schedule: PaymentStage[]) => updateCurrentQuote({ paymentSchedule: schedule })} isReadOnly={isReadOnly} /> </div>
             </div>
        )}
      </main>

      <QuoteSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} quotes={quotes} currentQuoteId={currentQuote.id} onSelectQuote={handleSelectQuote} onNewQuote={handleGoToWelcome} onDeleteQuote={handleDeleteQuote} onDuplicateQuote={handleDuplicateQuote} onTogglePin={handleTogglePin} onRenameQuote={handleRenameQuote} onSaveTemplate={handleOpenSaveTemplateModal} templates={templates} onApplyTemplate={handleApplyTemplate} onDeleteTemplate={handleDeleteTemplate} isReadOnly={isReadOnly} />
      <PrintSettings 
        isOpen={isPrintSettingsOpen} 
        onClose={() => {
            setIsPrintSettingsOpen(false);
            setIsPrintConfirmationOpen(true);
        }} 
        settings={currentQuote.printSettings} 
        onChange={(settings) => updateCurrentQuote({ printSettings: settings })} 
      />
      {canEditSpecs && <CategoryEditor category={editingCategory} isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={(cat) => { const exists = currentQuote.categories.some(c => c.id === cat.id); let newCats; if (exists) { newCats = currentQuote.categories.map(c => c.id === cat.id ? cat : c); } else { newCats = [...currentQuote.categories, cat]; } updateCurrentQuote({ categories: newCats }); setIsEditorOpen(false); }} onLiveUpdate={() => {}} onDelete={(catId) => { updateCurrentQuote({ categories: currentQuote.categories.filter(c => c.id !== catId) }); setIsEditorOpen(false); }} isReadOnly={isReadOnly} />}
      <SaveTemplateModal isOpen={isSaveTemplateModalOpen} onClose={() => setIsSaveTemplateModalOpen(false)} onConfirm={handleConfirmSaveTemplate} defaultName={currentQuote.projectDetails.projectName || ''} quoteType={currentQuote.quoteType} />
      <ConfirmationModal isOpen={isConfirmationModalOpen} onClose={() => { setIsConfirmationModalOpen(false); handleGoToWelcome(); }} onNewQuote={() => { setIsConfirmationModalOpen(false); handleGoToWelcome(); }} onGoToArchive={() => { setIsConfirmationModalOpen(false); setViewMode('archive'); }} />
      <PrintConfirmationModal
        isOpen={isPrintConfirmationOpen}
        onClose={() => setIsPrintConfirmationOpen(false)}
        onConfirm={handleApproveAndPrint}
        onOpenSettings={() => {
          setIsPrintConfirmationOpen(false);
          setIsPrintSettingsOpen(true);
        }}
      />
    </div>
  );
};
