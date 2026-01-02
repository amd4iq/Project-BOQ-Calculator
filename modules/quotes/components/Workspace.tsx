
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Category, ProjectDetails, AreaRow, StandardSpec, PaymentStage } from '../../../core/types.ts';
import { useAuth } from '../../../components/Auth/AuthContext.tsx';
import { useAppSettings } from '../../../contexts/AppSettingsContext.tsx';
import { useQuote } from '../../../contexts/QuoteContext.tsx';
import { calculateQuoteTotals } from '../../../core/utils/calculations.ts';
import { downloadJSON, downloadCSV } from '../../../core/utils/export.ts';

// Shared Components
import { Icon } from '../../../components/Icons.tsx';
import { CategoryEditor } from '../../../components/CategoryEditor.tsx';

// Quote Specific Components
import { QuoteSidebar } from '../../../components/QuoteSidebar.tsx';
import { ProjectInfo } from '../../../components/ProjectInfo.tsx';
import { TechnicalSpecsTable } from '../../../components/TechnicalSpecsTable.tsx';
import { PriceBreakdown } from '../../../components/PriceBreakdown.tsx';
import { PaymentSchedule } from '../../../components/PaymentSchedule.tsx';
import { FixedAdditionsTable } from '../../../components/FixedAdditionsTable.tsx';
import { PrintSettings } from '../../../components/PrintSettings.tsx';
import { StandardSpecs } from '../../../components/ConstructionOffers/StandardSpecs.tsx';
import { ConfirmationModal } from '../../../components/ConfirmationModal.tsx';
import { SaveTemplateModal } from '../../../components/SaveTemplateModal.tsx';
import { PrintController } from '../../../PrintEngine/PrintController.tsx';
import { PrintConfirmationModal } from '../../../components/PrintConfirmationModal.tsx';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal.tsx';

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
    updateQuoteStatus,
    forceDeleteQuote
  } = useQuote();

  const [activeTab, setActiveTab] = useState<'technical' | 'additions' | 'standard'>('technical');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  
  useEffect(() => {
    if (currentQuote?.quoteType === 'finishes' && activeTab === 'standard') {
        setActiveTab('technical');
    }
  }, [currentQuote?.quoteType, activeTab]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isReadOnly) {
        event.preventDefault();
        event.returnValue = 'لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في الخروج؟';
        return 'لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في الخروج؟';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isReadOnly]);

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
    setIsPrintConfirmationOpen(false);
    const now = Date.now();
    updateQuoteStatus(currentQuote.id, 'Printed - Pending Client Approval', {
        approvedAt: now,
        printedAt: now,
        validUntil: now + (14 * 24 * 60 * 60 * 1000),
        printLog: [...(currentQuote.printLog || []), { printedBy: auth.currentUser.displayName || auth.currentUser.name, printedAt: now, version: currentQuote.version }],
    });
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsConfirmationModalOpen(true);
      }, 1000);
    }, 300);
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

  const handleExitWithConfirmation = () => {
    if (isReadOnly) {
        handleGoToWelcome();
    } else {
        setIsUnsavedModalOpen(true);
    }
  };

  const handleArchiveWithConfirmation = () => {
    if(isReadOnly) {
        setViewMode('archive');
    } else {
        setIsUnsavedModalOpen(true);
    }
  }

  const handleDiscardAndExit = () => {
    if (currentQuote && currentQuote.status === 'Draft') {
        forceDeleteQuote(currentQuote.id);
    }
    setIsUnsavedModalOpen(false);
    handleGoToWelcome();
  };

  const handleSaveAndExit = () => {
    setIsUnsavedModalOpen(false);
    handleGoToWelcome();
  };

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
    <div className="h-screen flex flex-col bg-slate-100 font-sans text-slate-900 overflow-hidden" dir="rtl">
      <PrintController quote={currentQuote} totals={quoteTotals} companyInfo={settings.companyInfo} />
      
      {/* Fixed Navbar (h-20) */}
      <nav className="bg-white border-b border-slate-200 px-6 h-20 shrink-0 flex items-center justify-between z-50 print:hidden shadow-sm">
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
              <button
                  onClick={handleExitWithConfirmation}
                  title="الصفحة الرئيسية"
                  className="p-3 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 rounded-xl transition-all"
              >
                  <Icon name="home" size={20} />
              </button>
              <button
                  onClick={() => setIsSidebarOpen(true)}
                  title="قوالب جاهزة"
                  className="flex items-center gap-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-all font-bold text-sm"
              >
                  <Icon name="template" size={16} />
                  <span>القوالب</span>
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div>
                  <h1 className="text-xl font-black text-slate-800 leading-tight">
                      معالم بغداد للعمارة والديكور
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
              {isReadOnly ? (
                  <div className="flex items-center gap-3">
                      <button
                          onClick={() => setViewMode('archive')}
                          className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                          title="العودة إلى الأرشيف"
                      >
                          <Icon name="archive" size={16} />
                          <span>العودة للأرشيف</span>
                      </button>
                      <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-slate-500/20 transition-all active:scale-95">
                          <Icon name="printer" size={18} />
                          <span>طباعة (أرشيف)</span>
                      </button>
                  </div>
              ) : (
                  <>
                      <button
                          onClick={() => {
                              if (currentQuote && window.confirm('هل أنت متأكد من إلغاء هذا العرض؟ سيتم حذفه نهائياً.')) {
                                  forceDeleteQuote(currentQuote.id);
                                  handleGoToWelcome();
                              }
                          }}
                          className="flex items-center gap-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 px-3 py-2 rounded-lg font-bold text-xs transition-all"
                          title="إلغاء وحذف العرض الحالي"
                      >
                          <Icon name="trash" size={14} />
                          <span>إلغاء العرض</span>
                      </button>
                      <button
                          onClick={handleGoToWelcome}
                          className="flex items-center gap-1.5 bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100 px-3 py-2 rounded-lg font-bold text-xs transition-all"
                          title="حفظ العرض كمسودة والعودة للرئيسية"
                      >
                          <Icon name="save" size={14} />
                          <span>حفظ كمسودة</span>
                      </button>

                      <div className="h-6 w-px bg-slate-200 mx-1"></div>

                      <button onClick={() => setIsPrintConfirmationOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                          <Icon name="printer" size={18} />
                          <span>اعتماد وطباعة</span>
                      </button>
                  </>
              )}
              
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="relative group">
                  <button className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200/80">
                      <Icon name="user" size={16} />
                      <span>{auth.currentUser.displayName || auth.currentUser.name}</span>
                  </button>
              </div>
          </div>
      </nav>

      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-hidden">
         <div className="flex flex-col lg:flex-row h-full">
            <div className="w-full lg:w-[60%] h-full overflow-y-auto custom-scrollbar p-6 pb-24 space-y-6">
                {isReadOnly && (
                    <div className="p-4 bg-amber-50 text-amber-800 border-2 border-dashed border-amber-200 rounded-2xl flex items-center gap-3">
                        <Icon name="archive" size={24} className="text-amber-600" />
                        <div><h3 className="font-bold">عرض مؤرشف (للقراءة فقط)</h3></div>
                    </div>
                )}
                <ProjectInfo details={currentQuote.projectDetails} quoteType={currentQuote.quoteType} onChange={handleProjectDetailChange} onUpdateBreakdown={(b) => updateCurrentQuote({ areaBreakdown: b })} savedBreakdown={currentQuote.areaBreakdown} quoteTotals={quoteTotals} isReadOnly={isReadOnly} />
                <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 flex-1 justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                            <Icon name={tab.icon} size={18} />{tab.label}
                        </button>
                    ))}
                </div>
                <div className="min-h-[300px]">
                    {activeTab === 'technical' && <TechnicalSpecsTable categories={technicalCategories} selections={currentQuote.selections} onSelect={handleSelection} onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }} onNewCategory={() => { setEditingCategory(null); setIsEditorOpen(true); }} projectDetails={currentQuote.projectDetails} quoteType={currentQuote.quoteType} isReadOnly={isReadOnly} />}
                    {activeTab === 'additions' && fixedAdditionsCategory && <FixedAdditionsTable category={fixedAdditionsCategory} selectedIds={(currentQuote.selections.fixed_additions as string[]) || []} onSelect={(catId, optId) => { const current = (currentQuote.selections.fixed_additions as string[]) || []; const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId]; handleSelection(catId, next); }} onEditCategory={(cat) => { setEditingCategory(cat); setIsEditorOpen(true); }} onUpdateCategory={(cat) => { const nextCats = currentQuote.categories.map(c => c.id === cat.id ? cat : c); updateCurrentQuote({ categories: nextCats }); }} isReadOnly={isReadOnly} canEdit={canEditSpecs} />}
                    {activeTab === 'standard' && <StandardSpecs specs={currentQuote.standardSpecs} onAdd={(t) => updateCurrentQuote({ standardSpecs: [...currentQuote.standardSpecs, { id: Date.now().toString(), text: t }] })} onDelete={(id) => updateCurrentQuote({ standardSpecs: currentQuote.standardSpecs.filter(s => s.id !== id) })} onUpdate={(id, nt) => updateCurrentQuote({ standardSpecs: currentQuote.standardSpecs.map(s => s.id === id ? { ...s, text: nt } : s) })} isReadOnly={isReadOnly} />}
                </div>
            </div>
            <div className="w-full lg:w-[40%] h-full overflow-y-auto custom-scrollbar p-6 pb-24 space-y-6 bg-white border-r border-slate-200">
                 {quoteTotals && (
                    <>
                        <PriceBreakdown categories={currentQuote.categories} selections={currentQuote.selections} projectDetails={currentQuote.projectDetails} showIndividualPrices={currentQuote.printSettings.showDetails} quoteTotals={quoteTotals} quoteType={currentQuote.quoteType} onBasePriceChange={(val) => handleProjectDetailChange('basePricePerM2', val)} isReadOnly={isReadOnly} /> 
                        <PaymentSchedule schedule={currentQuote.paymentSchedule || []} totalAmount={quoteTotals.grandTotal} onChange={(s) => updateCurrentQuote({ paymentSchedule: s })} isReadOnly={isReadOnly} />
                    </>
                 )}
            </div>
         </div>
      </main>

      <QuoteSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} quotes={quotes} currentQuoteId={currentQuote.id} onSelectQuote={handleSelectQuote} onNewQuote={handleGoToWelcome} onDeleteQuote={handleDeleteQuote} onDuplicateQuote={handleDuplicateQuote} onTogglePin={handleTogglePin} onRenameQuote={handleRenameQuote} onSaveTemplate={handleOpenSaveTemplateModal} templates={templates} onApplyTemplate={handleApplyTemplate} onDeleteTemplate={handleDeleteTemplate} isReadOnly={isReadOnly} />
      <PrintSettings isOpen={isPrintSettingsOpen} onClose={() => { setIsPrintSettingsOpen(false); setIsPrintConfirmationOpen(true); }} settings={currentQuote.printSettings} onChange={(s) => updateCurrentQuote({ printSettings: s })} />
      {canEditSpecs && <CategoryEditor
          category={editingCategory}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(cat) => {
              if (!currentQuote) return;
              const { categories, selections } = currentQuote;
              const exists = categories.some(c => c.id === cat.id);
              let newCats;
              let newSelections = { ...selections };

              if (exists) {
                  newCats = categories.map(c => c.id === cat.id ? cat : c);
              } else {
                  newCats = [...categories, cat];
                  if (cat.allowMultiple) {
                      newSelections[cat.id] = [];
                  } else {
                      newSelections[cat.id] = {
                          default: cat.options[0]?.id || '',
                          overrides: {},
                          percentages: {}
                      };
                  }
              }
              updateCurrentQuote({ categories: newCats, selections: newSelections });
              setIsEditorOpen(false);
          }}
          onLiveUpdate={() => {}}
          onDelete={(catId) => {
              if (!currentQuote) return;
              const newCats = currentQuote.categories.filter(c => c.id !== catId);
              const newSelections = { ...currentQuote.selections };
              delete newSelections[catId];
              updateCurrentQuote({ categories: newCats, selections: newSelections });
              setIsEditorOpen(false);
          }}
          isReadOnly={isReadOnly}
      />}
      <SaveTemplateModal isOpen={isSaveTemplateModalOpen} onClose={() => setIsSaveTemplateModalOpen(false)} onConfirm={handleConfirmSaveTemplate} defaultName={currentQuote.projectDetails.projectName || ''} quoteType={currentQuote.quoteType} />
      <ConfirmationModal isOpen={isConfirmationModalOpen} onClose={() => { setIsConfirmationModalOpen(false); handleGoToWelcome(); }} onNewQuote={() => { setIsConfirmationModalOpen(false); handleGoToWelcome(); }} onGoToArchive={() => { setIsConfirmationModalOpen(false); setViewMode('archive'); }} />
      <PrintConfirmationModal isOpen={isPrintConfirmationOpen} onClose={() => setIsPrintConfirmationOpen(false)} onConfirm={handleApproveAndPrint} onOpenSettings={() => { setIsPrintConfirmationOpen(false); setIsPrintSettingsOpen(true); }} />
      <UnsavedChangesModal isOpen={isUnsavedModalOpen} onClose={() => setIsUnsavedModalOpen(false)} onDiscard={handleDiscardAndExit} onSave={handleSaveAndExit} />
    </div>
  );
};
