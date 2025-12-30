
import React from 'react';
import { SavedQuote, CompanyInfo, CategorySelection } from '../types';
import { PrintLayoutHeader, TitleBar } from './PrintComponents';
import { formatCurrency } from '../utils/format';

type QuoteTotals = any;

interface ArchivedQuotePrintSummaryProps {
  quote: Omit<SavedQuote, 'history'>;
  totals: QuoteTotals;
  companyInfo: CompanyInfo;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div style={{ padding: '2mm', border: '0.5pt solid #eee', borderRadius: '1mm' }}>
        <p style={{ margin: 0, fontSize: '7pt', color: '#666' }}>{label}</p>
        <p style={{ margin: '0.5mm 0 0 0', fontSize: '10pt', fontWeight: 'bold' }}>{value}</p>
    </div>
);

export const ArchivedQuotePrintSummary: React.FC<ArchivedQuotePrintSummaryProps> = ({ quote, totals, companyInfo }) => {
  const technicalCategories = quote.categories.filter(c => c.id !== 'fixed_additions' && !c.allowMultiple);
  const fixedAdditionsCategory = quote.categories.find(c => c.id === 'fixed_additions');
  const selectedFixedAdditionsIds = (quote.selections.fixed_additions as string[]) || [];
  const selectedFixedAdditions = fixedAdditionsCategory?.options.filter(opt => selectedFixedAdditionsIds.includes(opt.id)) || [];

  return (
    <div className="hidden print:block">
      <div className="doc-print-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <PrintLayoutHeader quote={quote as SavedQuote} companyInfo={companyInfo} />
        <main className="doc-print-content" style={{ paddingTop: '5mm' }}>

            <div style={{ textAlign: 'center', margin: '3mm 0 6mm 0' }}>
                <h1 style={{ fontSize: '16pt', fontWeight: 900, borderBottom: '1pt solid #ccc', paddingBottom: '2mm', display: 'inline-block' }}>
                    ملخص عرض سعر مؤرشف
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3mm', marginBottom: '6mm' }}>
                <InfoItem label="المشروع" value={quote.projectDetails.projectName} />
                <InfoItem label="العميل" value={quote.projectDetails.customerName} />
                <InfoItem label="رقم العرض" value={`${quote.offerNumber} (V${quote.version})`} />
                <InfoItem label="تاريخ الإنشاء" value={new Date(quote.createdAt).toLocaleDateString('ar-IQ')} />
                <InfoItem label="المساحة" value={`${quote.projectDetails.areaSize} م²`} />
                <InfoItem label="السعر/م²" value={formatCurrency(totals.finalPricePerM2)} />
            </div>

            <div style={{ padding: '5mm', backgroundColor: '#f3f4f6', borderRadius: '2mm', textAlign: 'center', marginBottom: '6mm' }}>
                <p style={{ margin: 0, fontSize: '9pt', color: '#374151', fontWeight: 'bold', textTransform: 'uppercase' }}>السعر الإجمالي النهائي</p>
                <p style={{ margin: '1mm 0 0 0', fontSize: '22pt', fontWeight: 900, color: '#111827' }}>
                    {formatCurrency(totals.grandTotal)} <span style={{ fontSize: '14pt', fontWeight: 'normal', color: '#10b981' }}>IQD</span>
                </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: selectedFixedAdditions.length > 0 ? '2fr 1fr' : '1fr', gap: '6mm' }}>
                <div>
                    <TitleBar title="المواصفات الفنية الرئيسية" />
                    <table className="doc-print-table w-full">
                        <tbody>
                        {technicalCategories.map(cat => {
                            const selection = quote.selections[cat.id] as CategorySelection;
                            const option = cat.options.find(o => o.id === selection.default);
                            if (!option) return null;
                            return (
                                <tr key={cat.id}>
                                    <td style={{ width: '40%', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>{cat.title}</td>
                                    <td>{option.label}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {selectedFixedAdditions.length > 0 && (
                     <div>
                        <TitleBar title="الإضافات" />
                        <table className="doc-print-table w-full">
                            <tbody>
                                {selectedFixedAdditions.map(opt => (
                                    <tr key={opt.id}>
                                        <td>{opt.label}</td>
                                        <td style={{ width: '40%', textAlign: 'left', fontFamily: 'monospace' }}>{formatCurrency(opt.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};
