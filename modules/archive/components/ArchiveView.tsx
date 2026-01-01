
import React, { useState, useMemo } from 'react';
import { SavedQuote, QuoteStatus } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';
import { ArchiveTable } from './ArchiveTable.tsx';
import { PrintLogModal } from './PrintLogModal.tsx';
import { ArchiveSidebar } from './ArchiveSidebar.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';
import { calculateQuoteTotals } from '../../../core/utils/calculations.ts';
import { useQuote } from '../../../contexts/QuoteContext.tsx';
import { useAppSettings } from '../../../contexts/AppSettingsContext.tsx';

interface ArchiveViewProps {
    allQuotes: SavedQuote[];
    onClose: () => void;
    onViewQuote: (id: string) => void;
    role: 'engineer' | 'admin';
    onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
    onGoToContracts: () => void;
    onGoToSettings: () => void;
    onViewContract: (contractId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ 
    allQuotes, 
    onClose, 
    onViewQuote, 
    role, 
    onUpdateQuoteStatus,
    onGoToContracts,
    onGoToSettings,
    onViewContract
}) => {
    const { handleDuplicateQuote, forceDeleteQuote } = useQuote();
    const { settings } = useAppSettings();
    const [activeSection, setActiveSection] = useState<'structure' | 'finishes' | 'final'>('structure');
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        quoteType: '',
    });
    
    const [viewingQuotePrintLog, setViewingQuotePrintLog] = useState<SavedQuote | null>(null);

    const revisionCounts = useMemo(() => {
        return {
            structure: allQuotes.filter(q => q.quoteType === 'structure' && (q.status === 'Under Revision' || q.status === 'Draft')).length,
            finishes: allQuotes.filter(q => q.quoteType === 'finishes' && (q.status === 'Under Revision' || q.status === 'Draft')).length
        };
    }, [allQuotes]);

    const isFinalArchivedStatus = (status: QuoteStatus) => {
        return ['Rejected by Client', 'Expired', 'Contract Signed', 'Contract Archived'].includes(status);
    };

    const filteredQuotes = useMemo(() => {
        let quotes = allQuotes; // Start with all quotes, including Drafts

        // Main Tab Logic
        if (activeSection === 'final') {
            quotes = quotes.filter(q => isFinalArchivedStatus(q.status));
        } else {
            // For Structure/Finishes tabs, show only active/pending quotes (NOT final)
            // This now correctly includes 'Draft' because we're filtering by what's NOT final.
            quotes = quotes.filter(q => q.quoteType === activeSection && !isFinalArchivedStatus(q.status));
        }

        // Apply Search & Filters
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            quotes = quotes.filter(q => 
                q.offerNumber.toLowerCase().includes(term) ||
                q.projectDetails.projectName.toLowerCase().includes(term) ||
                q.projectDetails.customerName.toLowerCase().includes(term)
            );
        }

        if (filters.status) quotes = quotes.filter(q => q.status === filters.status);
        if (filters.quoteType) quotes = quotes.filter(q => q.quoteType === filters.quoteType);
        
        return quotes.sort((a,b) => (b.lastModified || b.createdAt) - (a.lastModified || a.createdAt));
    }, [allQuotes, activeSection, filters]);
    
    const ongoingQuotes = useMemo(() => filteredQuotes.filter(q => ['Draft', 'Printed - Pending Client Approval', 'Under Revision'].includes(q.status)), [filteredQuotes]);
    const approvedQuotes = useMemo(() => filteredQuotes.filter(q => q.status === 'Approved by Client'), [filteredQuotes]);
    
    return (
        <div className="flex h-screen bg-slate-100 print-archive-list" dir="rtl">
            <ArchiveSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                filters={filters}
                onFilterChange={setFilters}
                onClose={onClose}
                revisionCounts={revisionCounts}
                onGoToContracts={onGoToContracts}
                onGoToSettings={onGoToSettings}
            />
            <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto">
                <header className="mb-8 print:hidden">
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">الأرشيف السحابي</h1>
                    <p className="text-slate-500 mt-1">إدارة العروض المعتمدة والمؤرشفة.</p>
                </header>
                
                <div className="space-y-12">
                    {activeSection === 'final' ? (
                        <ArchiveTable 
                            quotes={filteredQuotes} 
                            role={role} 
                            onViewQuote={onViewQuote} 
                            onUpdateQuoteStatus={onUpdateQuoteStatus} 
                            onDuplicateQuote={handleDuplicateQuote}
                            onOpenPrintLog={setViewingQuotePrintLog} 
                            onDeleteQuote={forceDeleteQuote}
                            isFinalArchive={true} 
                            onViewContract={onViewContract}
                        />
                    ) : (
                        <>
                            <section>
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
                                    <Icon name="zap" size={20} className="text-amber-500" />
                                    العروض الجارية (قيد المتابعة والتعديل)
                                </h2>
                                <ArchiveTable 
                                    quotes={ongoingQuotes} 
                                    role={role} 
                                    onViewQuote={onViewQuote} 
                                    onUpdateQuoteStatus={onUpdateQuoteStatus} 
                                    onDuplicateQuote={handleDuplicateQuote}
                                    onOpenPrintLog={setViewingQuotePrintLog} 
                                    onDeleteQuote={forceDeleteQuote}
                                    onViewContract={onViewContract}
                                />
                            </section>
                            <section>
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
                                    <Icon name="check-simple" size={20} className="text-emerald-500" />
                                    العروض المنجزة (بانتظار توقيع العقد)
                                </h2>
                                <ArchiveTable 
                                    quotes={approvedQuotes} 
                                    role={role} 
                                    onViewQuote={onViewQuote} 
                                    onUpdateQuoteStatus={onUpdateQuoteStatus} 
                                    onDuplicateQuote={handleDuplicateQuote}
                                    onOpenPrintLog={setViewingQuotePrintLog} 
                                    onDeleteQuote={forceDeleteQuote}
                                    onViewContract={onViewContract}
                                />
                            </section>
                        </>
                    )}
                </div>
            </main>
            <PrintLogModal isOpen={!!viewingQuotePrintLog} quote={viewingQuotePrintLog} onClose={() => setViewingQuotePrintLog(null)} />
        </div>
    )
};