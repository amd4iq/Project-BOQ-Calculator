import React from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';
import { StatusBadge } from './StatusBadge';
import { calculateQuoteTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/format';

interface ArchiveTableProps {
  quotes: SavedQuote[];
  role: 'engineer' | 'admin';
  onViewQuote: (id: string) => void;
  onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  onOpenSettings: (quote: SavedQuote) => void;
  onOpenPrintLog: (quote: SavedQuote) => void;
  isRevisionTable?: boolean;
}

const ActionMenu: React.FC<{ 
    quote: SavedQuote, 
    role: 'engineer' | 'admin', 
    onUpdateQuoteStatus: ArchiveTableProps['onUpdateQuoteStatus'],
    onOpenSettings: ArchiveTableProps['onOpenSettings'],
    onOpenPrintLog: ArchiveTableProps['onOpenPrintLog']
}> = ({ quote, role, onUpdateQuoteStatus, onOpenSettings, onOpenPrintLog }) => {
    
    if (role === 'engineer') {
        return (
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => onOpenPrintLog(quote)}
                    className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors"
                >
                    عرض سجل الطباعة
                </button>
            </div>
        )
    }

    const handleClientApproval = () => {
        if(window.confirm(`هل أنت متأكد من موافقة العميل على العرض ${quote.offerNumber}؟ سيتم نقله إلى الأرشيف النهائي.`)) {
            onUpdateQuoteStatus(quote.id, 'Approved by Client', { approvedByClientAt: Date.now() });
        }
    }
    
    const handleClientRejection = () => {
        if(window.confirm(`هل أنت متأكد من رفض العميل للعرض ${quote.offerNumber}؟ سيتم نقله إلى الأرشيف النهائي.`)) {
            onUpdateQuoteStatus(quote.id, 'Rejected by Client', { rejectedByClientAt: Date.now() });
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {quote.status === 'Printed - Pending Client Approval' && (
                <>
                    <button onClick={handleClientApproval} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                        <Icon name="check-simple" size={14}/> موافقة
                    </button>
                    <button onClick={handleClientRejection} className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1">
                       <Icon name="x" size={14}/> رفض
                    </button>
                    <div className="w-px h-5 bg-slate-200 mx-1"></div>
                </>
            )}
             <button 
                onClick={() => onOpenPrintLog(quote)}
                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                title="سجل الطباعة"
            >
                <Icon name="printer" size={16} />
            </button>
             <button 
                onClick={() => onOpenSettings(quote)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                title="إعدادات العرض"
            >
                <Icon name="settings" size={16} />
            </button>
        </div>
    )
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({ quotes, role, onViewQuote, onUpdateQuoteStatus, onOpenSettings, onOpenPrintLog, isRevisionTable }) => {
  if (quotes.length === 0) {
    return (
        <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Icon name="search" size={32} className="mx-auto text-slate-300 mb-2"/>
            <h3 className="font-bold text-slate-600">لا توجد عروض في هذا القسم</h3>
            <p className="text-sm text-slate-400 mt-1">
                جرب تغيير فلاتر البحث أو قم بأرشفة عرض جديد.
            </p>
        </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead className="bg-slate-50/70 border-b-2 border-slate-200">
                    <tr>
                        <th className="p-3 font-extrabold text-slate-600 text-right">رقم العرض</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right">المشروع / العميل</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right">تاريخ الإجراء</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right">القيمة الإجمالية</th>
                        <th className="p-3 font-extrabold text-slate-600 text-center">النسخة</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right">الحالة</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {quotes.map(quote => {
                        const totals = calculateQuoteTotals(quote.categories, quote.selections, quote.projectDetails, quote.quoteType);
                        return (
                        <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-primary-700 whitespace-nowrap">{quote.offerNumber}</td>
                            <td className="p-3">
                                <button onClick={() => onViewQuote(quote.id)} className="text-sm font-bold text-slate-800 hover:underline text-right block">
                                    {quote.projectDetails.projectName || 'مشروع بدون اسم'}
                                </button>
                                <span className="text-slate-500">{quote.projectDetails.customerName}</span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                                {new Date(quote.lastModified).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-3 text-emerald-600 font-bold font-mono whitespace-nowrap text-sm">
                                {formatCurrency(totals.grandTotal)} <span className="text-xs">IQD</span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-500">V{quote.version}</td>
                            <td className="p-3">
                                {isRevisionTable ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                                      <Icon name="pencil" size={14} /> قيد المراجعة
                                    </div>
                                ) : (
                                    <StatusBadge status={quote.status} validUntil={quote.validUntil} />
                                )}
                            </td>
                            <td className="p-3 w-56">
                                {isRevisionTable ? (
                                    <button 
                                        onClick={() => onViewQuote(quote.id)}
                                        className="text-xs font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors w-full text-center"
                                    >
                                        الانتقال للتعديل
                                    </button>
                                ) : (
                                    <ActionMenu 
                                        quote={quote} 
                                        role={role} 
                                        onUpdateQuoteStatus={onUpdateQuoteStatus}
                                        onOpenSettings={onOpenSettings}
                                        onOpenPrintLog={onOpenPrintLog}
                                    />
                                )}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    </div>
  );
};