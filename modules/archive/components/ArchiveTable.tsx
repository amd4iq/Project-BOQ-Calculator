
import React, { useState, useRef, useEffect } from 'react';
import { SavedQuote, QuoteStatus } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { calculateQuoteTotals } from '../../../core/utils/calculations.ts';
import { formatCurrency } from '../../../core/utils/format.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';

interface ArchiveTableProps {
  quotes: SavedQuote[];
  role: 'engineer' | 'admin' | 'accountant';
  onViewQuote: (id: string) => void;
  onUpdateQuoteStatus: (id: string, status: QuoteStatus, updates?: Partial<SavedQuote>) => void;
  onDuplicateQuote: (id: string, targetStatus?: QuoteStatus) => void;
  onOpenPrintLog: (quote: SavedQuote) => void;
  onDeleteQuote?: (id: string) => void; 
  isFinalArchive?: boolean;
  onViewContract?: (contractId: string) => void;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({ quotes, role, onViewQuote, onUpdateQuoteStatus, onDuplicateQuote, onDeleteQuote, onOpenPrintLog, isFinalArchive, onViewContract }) => {
  const { contracts } = useContract();
  const { createContractFromQuote } = useContract();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 print:border print:border-black print:rounded-none print:shadow-none">
        <div className={openMenuId ? "overflow-visible" : "overflow-x-auto"}>
            <table className="w-full text-xs print:text-[9px]">
                <thead className="bg-slate-50/70 border-b-2 border-slate-200 print:bg-gray-100 print:border-black">
                    <tr>
                        <th className="p-3 font-extrabold text-slate-600 text-center w-10 print:text-black print:p-1.5 print:border-r print:border-black">#</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">رقم العرض</th>
                        {isFinalArchive && <th className="p-3 font-extrabold text-slate-600 text-center print:text-black print:p-1.5 print:border-r print:border-black">نوع العرض</th>}
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">المشروع / العميل</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">تاريخ الإجراء</th>
                        <th className="p-3 font-extrabold text-slate-600 text-right print:text-black print:p-1.5 print:border-r print:border-black">المبلغ الاجمالي</th>
                        {isFinalArchive && <th className="p-3 font-extrabold text-slate-600 text-center print:text-black print:p-1.5 print:border-r print:border-black">بيانات العقد</th>}
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
                            <td className="p-3 whitespace-nowrap print:p-1.5 print:border-r print:border-black">
                                <button onClick={() => onViewQuote(quote.id)} className="font-mono font-bold text-primary-700 hover:underline print:text-black print:no-underline">
                                    {quote.offerNumber}
                                </button>
                            </td>
                            
                            {isFinalArchive && (
                                <td className="p-3 text-center print:p-1.5 print:border-r print:border-black">
                                    <span className={`px-2 py-1 rounded-md font-bold text-[10px] print:border print:border-black print:bg-transparent print:text-black print:px-1 print:py-0 ${quote.quoteType === 'structure' ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-600'}`}>
                                        {quote.quoteType === 'structure' ? 'بناء هيكل' : 'إنهاءات'}
                                    </span>
                                </td>
                            )}

                            <td className="p-3 print:p-1.5 print:border-r print:border-black">
                                <p className="text-xs font-bold text-slate-800 text-right block truncate max-w-[150px] print:text-[9px] print:max-w-none print:whitespace-normal">
                                    {quote.projectDetails.projectName || 'مشروع بدون اسم'}
                                </p>
                                <span className="text-[11px] text-slate-500 truncate block max-w-[150px] print:text-black print:text-[8px] print:max-w-none">{quote.projectDetails.customerName}</span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono whitespace-nowrap print:text-black print:p-1.5 print:border-r print:border-black">
                                {new Date(quote.lastModified).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-3 text-emerald-600 font-bold font-mono whitespace-nowrap text-sm print:text-black print:text-[9px] print:p-1.5 print:border-r print:border-black">
                                {formatCurrency(totals.grandTotal)}
                            </td>
                            {isFinalArchive && (
                                <td className="p-3 text-center print:p-1.5 print:border-r print:border-black">
                                    {contract ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <button onClick={() => onViewContract?.(contract.id)} className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mb-0.5 whitespace-nowrap hover:underline hover:bg-indigo-100 print:border-black print:text-black print:bg-transparent print:no-underline">
                                                {contract.contractNumber}
                                            </button>
                                            <span className="text-[9px] text-slate-400 font-medium print:hidden">
                                                {new Date(contract.startDate).toLocaleDateString('ar-IQ')}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-200 text-lg font-bold print:text-transparent">-</span>
                                    )}
                                </td>
                            )}
                            <td className="p-3 text-center font-mono font-bold text-slate-500 print:text-black print:p-1.5 print:border-r print:border-black">V{quote.version}</td>
                            
                            <td className="p-3 text-center align-middle print:p-1.5 print:border-black">
                                <div className="flex justify-center">
                                    <StatusBadge status={quote.status} validUntil={quote.validUntil} />
                                </div>
                            </td>

                            <td className="p-3 align-middle print:hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1 w-full relative">
                                    {/* Primary actions */}
                                    {role === 'admin' && quote.status === 'Draft' && <button onClick={() => onViewQuote(quote.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="إكمال العرض"><Icon name="pencil" size={16} /></button>}
                                    {role === 'admin' && quote.status === 'Under Revision' && <button onClick={() => onViewQuote(quote.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="الانتقال للتعديل"><Icon name="pencil" size={16} /></button>}
                                    {role === 'admin' && quote.status === 'Printed - Pending Client Approval' && (
                                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                                            <button onClick={() => { if(window.confirm(`موافقة العميل على ${quote.offerNumber}؟`)) { onUpdateQuoteStatus(quote.id, 'Approved by Client', { approvedByClientAt: Date.now() }); }}} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="موافقة"><Icon name="check-simple" size={16} /></button>
                                            <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                                            <button onClick={() => { if(window.confirm(`رفض العميل للعرض ${quote.offerNumber}؟`)) { onUpdateQuoteStatus(quote.id, 'Rejected by Client', { rejectedByClientAt: Date.now() }); }}} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="رفض"><Icon name="x" size={16} /></button>
                                        </div>
                                    )}
                                    {(role === 'admin' || role === 'accountant') && quote.status === 'Approved by Client' && (
                                        <button onClick={() => { if(window.confirm(`توقيع العقد للعرض ${quote.offerNumber}؟`)) { createContractFromQuote(quote); onUpdateQuoteStatus(quote.id, 'Contract Signed'); alert("تم إنشاء العقد بنجاح!"); }}} className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center gap-1 whitespace-nowrap"><Icon name="contract" size={14} />توقيع العقد</button>
                                    )}

                                    {/* Settings Dropdown */}
                                    <div ref={openMenuId === quote.id ? menuRef : null}>
                                        <button onClick={() => setOpenMenuId(openMenuId === quote.id ? null : quote.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="إجراءات إضافية"><Icon name="settings" size={16} /></button>
                                        {openMenuId === quote.id && (
                                            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95">
                                                {role === 'admin' && <button onClick={() => { if(window.confirm('فتح قفل التعديل؟ سيتم إنشاء نسخة جديدة للمراجعة.')) { onUpdateQuoteStatus(quote.id, 'Under Revision'); } setOpenMenuId(null); }} className="w-full text-right flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700"><Icon name="rotate-ccw" size={14}/> فتح قفل التعديل</button>}
                                                {role === 'admin' && <button onClick={() => { if(window.confirm('إنشاء نسخة جديدة من هذا العرض؟')) { onDuplicateQuote(quote.id, 'Under Revision'); } setOpenMenuId(null); }} className="w-full text-right flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700"><Icon name="copy" size={14}/> نسخ كعرض جديد</button>}
                                                
                                                {quote.status !== 'Draft' && <button onClick={() => { onOpenPrintLog(quote); setOpenMenuId(null); }} className="w-full text-right flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700"><Icon name="printer" size={14}/> سجل الطباعة</button>}
                                                
                                                {role === 'admin' && onDeleteQuote && (
                                                    <><div className="h-px bg-slate-100 my-1"></div><button onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا العرض نهائياً؟')) { onDeleteQuote(quote.id); } setOpenMenuId(null); }} className="w-full text-right flex items-center gap-2 p-2 rounded-lg text-xs font-semibold hover:bg-rose-50 text-rose-600"><Icon name="trash" size={14}/> حذف نهائي</button></>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    </div>
  );
};
