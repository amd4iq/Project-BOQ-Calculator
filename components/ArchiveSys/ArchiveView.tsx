
import React, { useState, useMemo } from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';
import { ArchiveTable } from './ArchiveTable';
import { ArchiveSettingsModal } from './ArchiveSettingsModal';
import { PrintLogModal } from './PrintLogModal';
import { ArchiveSidebar } from './ArchiveSidebar';
import { formatCurrency } from '../../utils/format';
import { calculateQuoteTotals } from '../../utils/calculations';
import { useQuote } from '../../contexts/QuoteContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';

interface ArchiveViewProps {
    allQuotes: SavedQuote[];
    onClose: () => void;
    onViewQuote: (id: string) => void;
    role: 'engineer' | 'admin';
    onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
    onGoToContracts: () => void;
    onGoToSettings: () => void;
}

const SummaryCard: React.FC<{ title: string; count: number; value: number; icon: string; color: string }> = ({ title, count, value, icon, color }) => {
    const colors: any = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    
    return (
        <div className={`p-4 rounded-2xl border ${colors[color] || colors.slate} flex items-center justify-between`}>
            <div>
                <p className="text-xs font-bold opacity-70 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{count}</span>
                    <span className="text-xs font-medium opacity-60">عرض</span>
                </div>
                <p className="text-xs font-mono font-bold mt-1 opacity-80">{formatCurrency(value)} IQD</p>
            </div>
            <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm`}>
                <Icon name={icon} size={24} />
            </div>
        </div>
    )
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ 
    allQuotes, 
    onClose, 
    onViewQuote, 
    role, 
    onUpdateQuoteStatus,
    onGoToContracts,
    onGoToSettings
}) => {
    const { handleDuplicateQuote } = useQuote();
    const { settings } = useAppSettings();
    const [activeSection, setActiveSection] = useState<'structure' | 'finishes' | 'final'>('structure');
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });
    
    const [configuringQuote, setConfiguringQuote] = useState<SavedQuote | null>(null);
    const [viewingQuotePrintLog, setViewingQuotePrintLog] = useState<SavedQuote | null>(null);

    // Calculate revision counts for sidebar (Global)
    const revisionCounts = useMemo(() => {
        return {
            structure: allQuotes.filter(q => q.quoteType === 'structure' && q.status === 'Under Revision').length,
            finishes: allQuotes.filter(q => q.quoteType === 'finishes' && q.status === 'Under Revision').length
        };
    }, [allQuotes]);

    // Helper to determine if a quote is "Final"
    const isFinalStatus = (status: QuoteStatus) => {
        return ['Approved by Client', 'Rejected by Client', 'Expired', 'Contract Signed', 'Contract Archived'].includes(status);
    };

    const filteredQuotes = useMemo(() => {
        let quotes = allQuotes.filter(q => q.status !== 'Draft');

        // Main Tab Logic
        if (activeSection === 'final') {
            quotes = quotes.filter(q => isFinalStatus(q.status));
        } else {
            // For Structure/Finishes tabs, show only active/pending quotes (NOT final)
            quotes = quotes.filter(q => q.quoteType === activeSection && !isFinalStatus(q.status));
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

        if (filters.status) {
            quotes = quotes.filter(q => q.status === filters.status);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom).getTime();
            quotes = quotes.filter(q => (q.printedAt || q.createdAt) >= fromDate);
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999); 
            quotes = quotes.filter(q => (q.printedAt || q.createdAt) <= toDate);
        }
        
        return quotes.sort((a,b) => (b.lastModified || b.createdAt) - (a.lastModified || a.createdAt));
    }, [allQuotes, activeSection, filters]);

    // Active Quotes Separation
    const temporaryArchive = useMemo(() => filteredQuotes.filter(q => q.status === 'Printed - Pending Client Approval'), [filteredQuotes]);
    const revisionArchive = useMemo(() => filteredQuotes.filter(q => q.status === 'Under Revision'), [filteredQuotes]);
    
    // Final Archive Summary Data
    const summaryData = useMemo(() => {
        if (activeSection !== 'final') return null;

        const accepted = filteredQuotes.filter(q => ['Approved by Client', 'Contract Signed', 'Contract Archived'].includes(q.status));
        const rejected = filteredQuotes.filter(q => q.status === 'Rejected by Client');
        const expired = filteredQuotes.filter(q => q.status === 'Expired');

        const calcTotal = (qs: SavedQuote[]) => qs.reduce((sum, q) => sum + calculateQuoteTotals(q.categories, q.selections, q.projectDetails, q.quoteType).grandTotal, 0);

        return {
            accepted: { count: accepted.length, value: calcTotal(accepted) },
            rejected: { count: rejected.length, value: calcTotal(rejected) },
            expired: { count: expired.length, value: calcTotal(expired) },
        };
    }, [filteredQuotes, activeSection]);

    const handleOpenSettings = (quote: SavedQuote) => setConfiguringQuote(quote);
    const handleOpenPrintLog = (quote: SavedQuote) => setViewingQuotePrintLog(quote);
    const handleClosePrintLog = () => setViewingQuotePrintLog(null);

    const getReportTitle = () => {
        switch(activeSection) {
            case 'structure': return 'سجل أرشيف عروض بناء الهيكل (قيد المراجعة)';
            case 'finishes': return 'سجل أرشيف عروض الإنهاءات (قيد المراجعة)';
            case 'final': return 'السجل الكامل للأرشيف النهائي';
            default: return 'سجل الأرشيف';
        }
    };

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
            
            {/* Main content area adapted for print */}
            <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto">
                
                {/* Print Only Header */}
                <div className="hidden print:block mb-4 border-b border-black pb-2">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-xl font-bold">{settings?.companyInfo.name}</h1>
                            <p className="text-sm">{getReportTitle()}</p>
                        </div>
                        <div className="text-left text-[10px] font-mono">
                            <p>تاريخ الطباعة: {new Date().toLocaleDateString('en-GB')}</p>
                            <p>عدد السجلات: {filteredQuotes.length}</p>
                        </div>
                    </div>
                </div>

                <header className="mb-8 print:hidden">
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">
                       {activeSection === 'structure' && 'ارشيف عروض بناء الهيكل'}
                       {activeSection === 'finishes' && 'ارشيف عروض الإنهاءات'}
                       {activeSection === 'final' && 'الأرشيف'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {activeSection === 'final' ? 'سجل تاريخي لجميع العروض التي تم اتخاذ قرار نهائي بشأنها' : 'متابعة العروض الجارية والمعلقة'}
                    </p>
                </header>

                {activeSection === 'final' && summaryData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 print:hidden">
                        <SummaryCard 
                            title="تمت الموافقة والتعاقد" 
                            count={summaryData.accepted.count} 
                            value={summaryData.accepted.value} 
                            icon="check-circle" 
                            color="emerald" 
                        />
                        <SummaryCard 
                            title="العقود المرفوضة" 
                            count={summaryData.rejected.count} 
                            value={summaryData.rejected.value} 
                            icon="x-circle" 
                            color="rose" 
                        />
                        <SummaryCard 
                            title="العقود المنتهية الصلاحية" 
                            count={summaryData.expired.count} 
                            value={summaryData.expired.value} 
                            icon="clock" 
                            color="slate" 
                        />
                    </div>
                )}

                <div className="space-y-12 print:space-y-4">
                    {activeSection === 'final' ? (
                        <section className="animate-in fade-in duration-500">
                            <ArchiveTable 
                                quotes={filteredQuotes} 
                                role={role} 
                                onViewQuote={onViewQuote}
                                onUpdateQuoteStatus={onUpdateQuoteStatus}
                                onOpenSettings={handleOpenSettings}
                                onOpenPrintLog={handleOpenPrintLog}
                                isFinalArchive={true} 
                            />
                        </section>
                    ) : (
                        <>
                            <section>
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4 print:mb-1 print:text-black print:text-sm">
                                    <Icon name="zap" size={20} className="text-amber-500 print:hidden" />
                                    بانتظار قرار العميل
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
                            
                            <section className="print:mt-4">
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4 print:mb-1 print:text-black print:text-sm">
                                    <Icon name="pencil" size={20} className="text-blue-500 print:hidden" />
                                    عروض قيد المراجعة والتعديل
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
                        </>
                    )}
                </div>
            </main>
            
            <ArchiveSettingsModal 
                isOpen={!!configuringQuote}
                quote={configuringQuote}
                onClose={() => setConfiguringQuote(null)}
                onUpdateQuote={onUpdateQuoteStatus}
                onDuplicateQuote={handleDuplicateQuote}
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
