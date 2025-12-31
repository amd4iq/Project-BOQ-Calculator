
import React from 'react';
import { SavedQuote, QuoteStatus } from '../../types';
import { Icon } from '../Icons';
import { StatusBadge } from './StatusBadge';
import { calculateQuoteTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/format';
import { useContract } from '../../contexts/ContractContext';

interface ArchiveTableProps {
  quotes: SavedQuote[];
  role: 'engineer' | 'admin';
  onViewQuote: (id: string) => void;
  onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  onOpenSettings: (quote: SavedQuote) => void;
  onOpenPrintLog: (quote: SavedQuote) => void;
  isRevisionTable?: boolean;
  isFinalArchive?: boolean;
}

const ActionMenu: React.FC<{ 
    quote: SavedQuote, 
    role: 'engineer' | 'admin', 
    onUpdateQuoteStatus: ArchiveTableProps['onUpdateQuoteStatus'],
    onOpenSettings: ArchiveTableProps['onOpenSettings'],
    onOpenPrintLog: ArchiveTableProps['onOpenPrintLog'],
    isFinalArchive?: boolean
}> = ({ quote, role, onUpdateQuoteStatus, onOpenSettings, onOpenPrintLog, isFinalArchive }) => {
    
    const { createContractFromQuote } = useContract();

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

    const handleSignContract = () => {
        if(window.confirm(`توقيع العقد للعرض ${quote.offerNumber}؟\nسيتم إنشاء سجل جديد في "إدارة العقود" لبدء تتبع المشروع مالياً.`)) {
            createContractFromQuote(quote);
            onUpdateQuoteStatus(quote.id, 'Contract Signed');
            alert("تم إنشاء العقد بنجاح! يمكنك متابعته الآن من قسم العقود والمشاريع.");
        }
    };

    return (
        <div className="flex items-center justify-end gap-1 w-full">
            
            {/* Pending Actions Group: Approve/Reject */}
            {quote.status === 'Printed - Pending Client Approval' && (
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm ml-auto">
                    <button 
                        onClick={handleClientApproval} 
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" 
                        title="موافقة العميل"
                    >
                        <Icon name="check" size={16} />
                    </button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                    <button 
                        onClick={handleClientRejection} 
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" 
                        title="رفض العميل"
                    >
                        <Icon name="x" size={16} />
                    </button>
                </div>
            )}

            {/* Primary Action: Sign Contract (Restricted to Admin) */}
            {quote.status === 'Approved by Client' && role === 'admin' && (
                <button 
                    onClick={handleSignContract}
                    className="ml-auto text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center gap-1 animate-in zoom-in whitespace-nowrap"
                >
                    <Icon name="contract" size={14} />
                    توقيع العقد
                </button>
            )}

            {/* Standard Icons Group */}
            <div className="flex items-center gap-1">
                 <button 
                    onClick={() => onOpenPrintLog(quote)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                    title="سجل الطباعة"
                >
                    <Icon name="printer" size={16} />
                </button>
                
                <button 
                    onClick={() => onOpenSettings(quote)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                    title="إعدادات العرض"
                >
                    <Icon name="settings" size={16} />
                </button>
            </div>
        </div>
    )
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({ quotes, role, onViewQuote, onUpdateQuoteStatus, onOpenSettings, onOpenPrintLog, isRevisionTable, isFinalArchive }) => {
  const { contracts } = useContract();

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border print:border-black print:rounded-none print:shadow-none">
        <div className="overflow-x-auto">
            <table className="w-full text-xs print:text-[9px]">
                <thead className="bg-slate-50/70 border-b-2 border-slate-200 print:bg-gray-100 print:border-black">
                    <tr>
                        <th className="p-3 font-extrabold text-slate-600 text-center w-10 print:text-black print:p-1.5 print:border-r print:border-black">#</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">رقم العرض</th>
                        {isFinalArchive && <th className="p-3 font-extrabold text-slate-600 text-center print:text-black print:p-1.5 print:border-r print:border-black">نوع العرض</th>}
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">المشروع / العميل</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">تاريخ الإجراء</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">القيمة الإجمالية</th>
                        <th className="p-3 font-extrabold text-slate-600 text-center print:text-black print:p-1.5 print:border-r print:border-black">بيانات العقد</th>
                        <th className="p-3 font-extrabold text-slate-600 text-center print:text-black print:p-1.5 print:border-r print:border-black">النسخة</th>
                        <th className="p-3 font-extrabold text-slate-600 text-center w-32 print:text-black print:p-1.5 print:border-black">الحالة</th>
                        <th className="p-3 font-extrabold text-slate-600 text-left w-36 print:hidden">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                    {quotes.map((quote, index) => {
                        const totals = calculateQuoteTotals(quote.categories, quote.selections, quote.projectDetails, quote.quoteType);
                        const contract = contracts.find(c => c.quoteId === quote.id);

                        return (
                        <tr key={quote.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                            <td className="p-3 text-center text-slate-400 font-mono font-bold print:text-black print:p-1.5 print:border-r print:border-black">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-primary-700 whitespace-nowrap print:text-black print:p-1.5 print:border-r print:border-black">{quote.offerNumber}</td>
                            
                            {isFinalArchive && (
                                <td className="p-3 text-center print:p-1.5 print:border-r print:border-black">
                                    <span className={`px-2 py-1 rounded-md font-bold text-[10px] print:border print:border-black print:bg-transparent print:text-black print:px-1 print:py-0 ${quote.quoteType === 'structure' ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-600'}`}>
                                        {quote.quoteType === 'structure' ? 'بناء هيكل' : 'إنهاءات'}
                                    </span>
                                </td>
                            )}

                            <td className="p-3 print:p-1.5 print:border-r print:border-black">
                                <button onClick={() => onViewQuote(quote.id)} className="text-sm font-bold text-slate-800 hover:underline text-right block truncate max-w-[150px] print:text-[9px] print:no-underline print:max-w-none print:whitespace-normal">
                                    {quote.projectDetails.projectName || 'مشروع بدون اسم'}
                                </button>
                                <span className="text-slate-500 truncate block max-w-[150px] print:text-black print:text-[8px] print:max-w-none">{quote.projectDetails.customerName}</span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono whitespace-nowrap print:text-black print:p-1.5 print:border-r print:border-black">
                                {new Date(quote.lastModified).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-3 text-emerald-600 font-bold font-mono whitespace-nowrap text-sm print:text-black print:text-[9px] print:p-1.5 print:border-r print:border-black">
                                {formatCurrency(totals.grandTotal)} <span className="text-xs print:text-[8px]">IQD</span>
                            </td>
                            <td className="p-3 text-center print:p-1.5 print:border-r print:border-black">
                                {contract ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mb-0.5 whitespace-nowrap print:border-black print:text-black print:bg-transparent">
                                            {contract.contractNumber}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-medium print:hidden">
                                            {new Date(contract.startDate).toLocaleDateString('ar-IQ')}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-200 text-lg font-bold print:text-transparent">-</span>
                                )}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-500 print:text-black print:p-1.5 print:border-r print:border-black">V{quote.version}</td>
                            
                            {/* Status Column */}
                            <td className="p-3 text-center align-middle print:p-1.5 print:border-black">
                                <div className="flex justify-center">
                                    <StatusBadge status={quote.status} validUntil={quote.validUntil} />
                                </div>
                            </td>

                            {/* Actions Column - Hidden in Print */}
                            <td className="p-3 align-middle print:hidden">
                                {isRevisionTable ? (
                                    <button 
                                        onClick={() => onViewQuote(quote.id)}
                                        className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 w-fit whitespace-nowrap"
                                    >
                                        <Icon name="pencil" size={14} /> الانتقال للتعديل
                                    </button>
                                ) : (
                                    <ActionMenu 
                                        quote={quote} 
                                        role={role} 
                                        onUpdateQuoteStatus={onUpdateQuoteStatus}
                                        onOpenSettings={onOpenSettings}
                                        onOpenPrintLog={onOpenPrintLog}
                                        isFinalArchive={isFinalArchive}
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
