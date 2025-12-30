import React, { useMemo } from 'react';
import { SavedQuote, Category, CategorySelection } from '../../types';
import { Icon } from '../Icons';
import { formatCurrency } from '../../utils/format';
import { calculateQuoteTotals } from '../../utils/calculations';

interface VersionViewerModalProps {
  quoteSnapshot: Omit<SavedQuote, 'history'> | null;
  isOpen: boolean;
  onClose: () => void;
}

// A small component to render a spec line
const SpecItem: React.FC<{ category: string, selection: string, costText?: string }> = ({ category, selection, costText }) => (
    <tr className="border-b border-slate-100 last:border-b-0">
        <td className="p-3 font-semibold text-slate-600 bg-slate-50 w-1/3">{category}</td>
        <td className="p-3 text-slate-800 font-bold">{selection}</td>
        {costText && <td className="p-3 text-left font-mono text-sm">{costText}</td>}
    </tr>
);

export const VersionViewerModal: React.FC<VersionViewerModalProps> = ({ quoteSnapshot, isOpen, onClose }) => {
    // Memoize totals calculation for the snapshot
    const totals = useMemo(() => {
        if (!quoteSnapshot) return null;
        return calculateQuoteTotals(
            quoteSnapshot.categories,
            quoteSnapshot.selections,
            quoteSnapshot.projectDetails,
            quoteSnapshot.quoteType
        );
    }, [quoteSnapshot]);

    if (!isOpen || !quoteSnapshot || !totals) return null;

    const technicalCategories = quoteSnapshot.categories.filter(c => c.id !== 'fixed_additions' && !c.allowMultiple);
    const fixedAdditionsCategory = quoteSnapshot.categories.find(c => c.id === 'fixed_additions');
    const selectedFixedAdditionsIds = (quoteSnapshot.selections.fixed_additions as string[]) || [];
    const selectedFixedAdditions = fixedAdditionsCategory?.options.filter(opt => selectedFixedAdditionsIds.includes(opt.id)) || [];

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="file-text" className="text-blue-600" />
                            عرض نسخة مؤرشفة
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {quoteSnapshot.projectDetails.projectName} - 
                            <span className="font-bold font-mono text-blue-700 mx-1">{quoteSnapshot.offerNumber}</span>
                            (النسخة <span className="font-bold font-mono text-blue-700">V{quoteSnapshot.version}</span>)
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Financials & Details */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="p-4 bg-slate-100 rounded-xl">
                             <p className="text-xs font-bold text-slate-400 uppercase">السعر الإجمالي</p>
                             <p className="text-3xl font-black text-slate-800">{formatCurrency(totals.grandTotal)} <span className="text-lg font-bold text-emerald-600">IQD</span></p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <p className="text-xs font-bold text-slate-400 uppercase">سعر المتر المربع</p>
                             <p className="text-xl font-bold text-slate-700">{formatCurrency(totals.finalPricePerM2)} <span className="text-sm font-medium">/ م²</span></p>
                        </div>
                        <div className="text-sm space-y-2 p-2">
                             <p><strong className="text-slate-500 w-24 inline-block">العميل:</strong> {quoteSnapshot.projectDetails.customerName}</p>
                             <p><strong className="text-slate-500 w-24 inline-block">المساحة:</strong> {quoteSnapshot.projectDetails.areaSize} م²</p>
                             <p><strong className="text-slate-500 w-24 inline-block">تاريخ الإنشاء:</strong> {new Date(quoteSnapshot.createdAt).toLocaleDateString('ar-IQ')}</p>
                        </div>
                    </div>

                    {/* Right Column - Specs */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                           <h3 className="font-bold text-slate-700 mb-2">المواصفات الفنية</h3>
                           <div className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                             <table className="w-full">
                               <tbody>
                                   {technicalCategories.map(cat => {
                                       const selection = quoteSnapshot.selections[cat.id] as CategorySelection;
                                       const option = cat.options.find(o => o.id === selection.default);
                                       if (!option) return null;
                                       return <SpecItem key={cat.id} category={cat.title} selection={option.label} />;
                                   })}
                               </tbody>
                             </table>
                           </div>
                        </div>
                        {selectedFixedAdditions.length > 0 && (
                            <div>
                               <h3 className="font-bold text-slate-700 mb-2">الإضافات المقطوعة</h3>
                               <div className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                                 <table className="w-full">
                                   <tbody>
                                      {selectedFixedAdditions.map(opt => (
                                          <SpecItem key={opt.id} category="إضافة" selection={opt.label} costText={formatCurrency(opt.cost)} />
                                      ))}
                                   </tbody>
                                 </table>
                               </div>
                            </div>
                        )}
                        {quoteSnapshot.standardSpecs.length > 0 && (
                             <div>
                               <h3 className="font-bold text-slate-700 mb-2">المواصفات القياسية المشمولة</h3>
                               <ul className="list-disc pr-5 text-xs space-y-1.5 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                   {quoteSnapshot.standardSpecs.map(spec => <li key={spec.id}>{spec.text}</li>)}
                               </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};
