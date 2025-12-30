
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, ReactNode } from 'react';
import { 
  QuoteType, 
  SavedQuote, 
  SelectionState, 
  Category, 
  ProjectDetails, 
  AreaRow, 
  StandardSpec, 
  PaymentStage,
  QuoteTemplate,
  QuoteStatus,
  PrintLogEntry,
  HistoryEntry,
} from '../types';
import { getConstantsForQuoteType } from '../constants';
import { generateOfferNumber } from '../utils/numbering';
import { useAuth } from '../components/Auth/AuthContext';
import { useAppSettings } from './AppSettingsContext';

const QUOTES_STORAGE_KEY = 'construction_quotes_v4';

interface QuoteContextType {
  quotes: SavedQuote[];
  templates: QuoteTemplate[];
  currentQuote: SavedQuote | undefined;
  currentQuoteId: string | null;
  isReadOnly: boolean;
  canEditSpecs: boolean;
  handleCreateQuote: (type: QuoteType) => void;
  updateCurrentQuote: (updates: Partial<SavedQuote>) => void;
  updateQuoteStatus: (id: string, newStatus: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  handleSelectQuote: (id: string) => void;
  setCurrentQuoteId: (id: string | null) => void;
  handleDeleteQuote: (id: string) => void;
  handleDuplicateQuote: (id: string) => void;
  handleTogglePin: (id: string) => void;
  handleRenameQuote: (id: string, newName: string) => void;
  handleSaveTemplate: (templateName: string) => void;
  handleApplyTemplate: (templateId: string) => void;
  handleDeleteTemplate: (templateId: string) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { settings } = useAppSettings();

    const [quotes, setQuotes] = useState<SavedQuote[]>([]);
    const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
    const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.quotes) setQuotes(parsed.quotes);
                if (parsed.templates) setTemplates(parsed.templates);
                if (parsed.currentQuoteId) setCurrentQuoteId(parsed.currentQuoteId);
            } catch (e) {
                console.error("Failed to parse saved quote data", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify({ quotes, templates, currentQuoteId }));
    }, [quotes, templates, currentQuoteId]);

    const currentQuote = useMemo(() => quotes.find(q => q.id === currentQuoteId), [quotes, currentQuoteId]);

    const isReadOnly = useMemo(() => {
        if (!currentQuote || !currentUser) return true;
        return currentQuote.status !== 'Draft' && currentQuote.status !== 'Under Revision';
    }, [currentQuote, currentUser]);

    const canEditSpecs = useMemo(() => !isReadOnly, [isReadOnly]);
    
    const handleCreateQuote = useCallback((type: QuoteType) => {
        if (!currentUser || !settings) return;
        
        const constants = getConstantsForQuoteType(type);
        const dynamicCategories = type === 'structure' ? settings.structureCategories : settings.finishesCategories;
        const now = Date.now();

        const newQuote: SavedQuote = {
            id: now.toString(),
            offerNumber: generateOfferNumber(type, quotes),
            version: 1,
            status: 'Draft',
            createdAt: now,
            createdBy: currentUser.displayName || currentUser.name,
            createdById: currentUser.id,
            lastModified: now,
            quoteType: type,
            isPinned: false,
            categories: dynamicCategories,
            selections: constants.DEFAULT_SELECTIONS,
            projectDetails: {
                employeeName: currentUser.displayName || currentUser.name,
                customerName: '',
                projectName: '',
                date: new Date().toISOString().split('T')[0],
                customerNumber: '',
                areaSize: 1,
                numberOfFloors: 1,
                spaces: [],
                basePricePerM2: type === 'structure' ? settings.basePrices.structure : settings.basePrices.finishes,
                enableBudgeting: false,
                targetBudget: 0,
                enableSpaceDistribution: false,
                specAllocationMode: 'spaces', // Default allocation mode
            },
            standardSpecs: constants.DEFAULT_STANDARD_SPECS,
            printSettings: {
                ...settings.defaultPrintSettings,
                logoUrl: settings.companyInfo.logoUrl,
            },
            paymentSchedule: constants.DEFAULT_PAYMENT_SCHEDULE,
            areaBreakdown: [],
            printLog: [],
            history: [],
        };
        setQuotes(prev => [...prev, newQuote]);
        setCurrentQuoteId(newQuote.id);
    }, [quotes, currentUser, settings]);
    
    const updateCurrentQuote = useCallback((updates: Partial<SavedQuote>) => {
        if (!currentQuoteId || isReadOnly) return;
        setQuotes(prev => prev.map(q => 
            q.id === currentQuoteId ? { ...q, ...updates, lastModified: Date.now() } : q
        ));
    }, [currentQuoteId, isReadOnly]);

    const updateQuoteStatus = useCallback((id: string, newStatus: QuoteStatus, updates: Partial<SavedQuote> = {}) => {
        if (!currentUser) return;
        setQuotes(prev => prev.map(q => {
            if (q.id !== id) return q;

            const originalQuote = { ...q };
            const newUpdates: Partial<SavedQuote> = { ...updates, status: newStatus, lastModified: Date.now() };
            
            const shouldCreateSnapshot = 
                (newStatus === 'Printed - Pending Client Approval' && q.status !== 'Printed - Pending Client Approval') ||
                (newStatus === 'Under Revision' && q.status !== 'Under Revision');

            if (shouldCreateSnapshot) {
                const snapshotReason = newStatus === 'Under Revision' ? 'تم فتح القفل للمراجعة' : 'تم اعتماد وطباعة النسخة';
                const { history, ...snapshotData } = originalQuote;
                const newHistoryEntry: HistoryEntry = {
                    version: originalQuote.version,
                    changedAt: Date.now(),
                    changedBy: currentUser.displayName || currentUser.name,
                    reason: snapshotReason,
                    snapshot: snapshotData
                };
                newUpdates.history = [...(originalQuote.history || []), newHistoryEntry];
            }

            if (newStatus === 'Under Revision' && q.status !== 'Under Revision') {
                newUpdates.version = (originalQuote.version || 1) + 1;
            }

            return { ...originalQuote, ...newUpdates };
        }));
    }, [currentUser]);

    const handleSelectQuote = useCallback((id: string) => setCurrentQuoteId(id), []);

    const handleDeleteQuote = useCallback((id: string) => {
        if (currentUser?.role !== 'admin' || quotes.length <= 1) return;
        const newQuotes = quotes.filter(q => q.id !== id);
        setQuotes(newQuotes);
        if (currentQuoteId === id) {
            setCurrentQuoteId(newQuotes.length > 0 ? newQuotes[0].id : null);
        }
    }, [quotes, currentQuoteId, currentUser]);

    const handleDuplicateQuote = useCallback((id: string) => {
        const quoteToDuplicate = quotes.find(q => q.id === id);
        if (!quoteToDuplicate || !currentUser) return;

        const now = Date.now();
        const newQuote: SavedQuote = {
          ...quoteToDuplicate,
          id: now.toString(),
          offerNumber: generateOfferNumber(quoteToDuplicate.quoteType, quotes),
          version: 1, status: 'Draft', createdAt: now, createdBy: currentUser.displayName || currentUser.name, createdById: currentUser.id,
          lastModified: now, isPinned: false,
          projectDetails: { ...quoteToDuplicate.projectDetails, projectName: `${quoteToDuplicate.projectDetails.projectName || 'مشروع جديد'} (نسخة)`, employeeName: currentUser.displayName || currentUser.name },
          approvedAt: undefined, printedAt: undefined, validUntil: undefined, approvedByClientAt: undefined,
          rejectedByClientAt: undefined, printLog: [], history: [],
        };
        setQuotes(prev => [...prev, newQuote]);
        setCurrentQuoteId(newQuote.id);
    }, [quotes, currentUser]);

    const handleTogglePin = useCallback((id: string) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, isPinned: !q.isPinned } : q));
    }, []);
    
    const handleRenameQuote = useCallback((id: string, newName: string) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, projectDetails: { ...q.projectDetails, projectName: newName }, lastModified: Date.now() } : q));
    }, []);

    const handleSaveTemplate = useCallback((templateName: string) => {
        if (!currentQuote) return;
        const newTemplate: QuoteTemplate = {
            id: `tpl-${Date.now()}`, name: templateName, quoteType: currentQuote.quoteType, selections: currentQuote.selections,
        };
        setTemplates(prev => [...prev, newTemplate]);
    }, [currentQuote]);

    const handleApplyTemplate = useCallback((templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template && !isReadOnly) {
            updateCurrentQuote({ selections: template.selections });
        }
    }, [templates, updateCurrentQuote, isReadOnly]);

    const handleDeleteTemplate = useCallback((templateId: string) => {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
    }, []);
    
    const value = {
        quotes, templates, currentQuote, currentQuoteId, isReadOnly, canEditSpecs, handleCreateQuote,
        updateCurrentQuote, updateQuoteStatus, handleSelectQuote, setCurrentQuoteId, handleDeleteQuote,
        handleDuplicateQuote, handleTogglePin, handleRenameQuote, handleSaveTemplate, handleApplyTemplate,
        handleDeleteTemplate,
    };

    return (
        <QuoteContext.Provider value={value}>
            {children}
        </QuoteContext.Provider>
    );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};
