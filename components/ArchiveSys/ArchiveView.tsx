
import React, { useState, useMemo } from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';
import { ArchiveTable } from './ArchiveTable';
import { ArchiveSettingsModal } from './ArchiveSettingsModal';
import { PrintLogModal } from './PrintLogModal';
import { ArchiveSidebar } from './ArchiveSidebar';

interface ArchiveViewProps {
    allQuotes: SavedQuote[];
    onClose: () => void;
    onViewQuote: (id: string) => void;
    role: 'engineer' | 'admin';
    onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ allQuotes, onClose, onViewQuote, role, onUpdateQuoteStatus }) => {
    const [activeSection, setActiveSection] = useState<'structure' | 'finishes'>('structure');
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });
    
    const [configuringQuote, setConfiguringQuote] = useState<SavedQuote | null>(null);
    const [viewingQuotePrintLog, setViewingQuotePrintLog] = useState<SavedQuote | null>(null);

    const quotesForArchiveView = useMemo(() => {
        return allQuotes.filter(q => q.status !== 'Draft');
    }, [allQuotes]);

    const filteredQuotes = useMemo(() => {
        let quotes = quotesForArchiveView.filter(q => q.quoteType === activeSection);

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            quotes = quotes.filter(q => 
                q.offerNumber.toLowerCase().includes(term) ||
                q.projectDetails.projectName.toLowerCase().includes(term) ||
                q.projectDetails.customerName.toLowerCase().includes(term)
            );
        }

        if (filters.status) {
            quotes = quotes.filter(q => q.status === filters.status);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom).getTime();
            quotes = quotes.filter(q => (q.printedAt || q.createdAt) >= fromDate);
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999); // Include the whole day
            quotes = quotes.filter(q => (q.printedAt || q.createdAt) <= toDate);
        }
        
        return quotes.sort((a,b) => (b.lastModified || b.createdAt) - (a.lastModified || a.createdAt));
    }, [quotesForArchiveView, activeSection, filters]);

    const temporaryArchive = useMemo(() => filteredQuotes.filter(q => q.status === 'Printed - Pending Client Approval'), [filteredQuotes]);
    const revisionArchive = useMemo(() => filteredQuotes.filter(q => q.status === 'Under Revision'), [filteredQuotes]);
    const finalArchive = useMemo(() => filteredQuotes.filter(q => q.status !== 'Printed - Pending Client Approval' && q.status !== 'Under Revision'), [filteredQuotes]);

    const handleOpenSettings = (quote: SavedQuote) => setConfiguringQuote(quote);
    const handleOpenPrintLog = (quote: SavedQuote) => setViewingQuotePrintLog(quote);
    const handleClosePrintLog = () => setViewingQuotePrintLog(null);

    return (
        <div className="flex h-screen bg-slate-100" dir="rtl">
            <ArchiveSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                filters={filters}
                onFilterChange={setFilters}
                onClose={onClose}
            />
            
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">
                       {activeSection === 'structure' ? 'ارشيف عروض بناء الهيكل' : 'ارشيف عروض الإنهاءات'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        استعراض وإدارة جميع العروض المعتمدة والمنتهية.
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Icon name="zap" size={20} className="text-amber-500" />
                            الأرشيف المؤقت (بانتظار قرار العميل)
                        </h2>
                        <ArchiveTable 
                            quotes={temporaryArchive} 
                            role={role} 
                            onViewQuote={onViewQuote}
                            onUpdateQuoteStatus={onUpdateQuoteStatus}
                            onOpenSettings={handleOpenSettings}
                            onOpenPrintLog={handleOpenPrintLog}
                        />
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Icon name="pencil" size={20} className="text-blue-500" />
                            العروض المفتوحة للتعديل
                        </h2>
                        <ArchiveTable 
                            quotes={revisionArchive} 
                            role={role} 
                            onViewQuote={onViewQuote}
                            onUpdateQuoteStatus={onUpdateQuoteStatus}
                            onOpenSettings={handleOpenSettings}
                            onOpenPrintLog={handleOpenPrintLog}
                            isRevisionTable={true}
                        />
                    </section>

                    <section>
                         <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Icon name="check-simple" size={20} className="text-emerald-500" />
                            الأرشيف النهائي (العقود والعروض المنتهية)
                        </h2>
                        <ArchiveTable 
                            quotes={finalArchive} 
                            role={role} 
                            onViewQuote={onViewQuote}
                            onUpdateQuoteStatus={onUpdateQuoteStatus}
                            onOpenSettings={handleOpenSettings}
                            onOpenPrintLog={handleOpenPrintLog}
                        />
                    </section>
                </div>
            </main>
            
            <ArchiveSettingsModal 
                isOpen={!!configuringQuote}
                quote={configuringQuote}
                onClose={() => setConfiguringQuote(null)}
                onUpdateQuote={onUpdateQuoteStatus}
                role={role}
            />
             <PrintLogModal
                isOpen={!!viewingQuotePrintLog}
                quote={viewingQuotePrintLog}
                onClose={handleClosePrintLog}
            />
        </div>
    )
};