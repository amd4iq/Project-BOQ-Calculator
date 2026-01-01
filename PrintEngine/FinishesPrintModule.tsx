import React from 'react';
// FIX: Corrected import path for types
import { SavedQuote, CompanyInfo, AreaRow, CategorySelection } from '../core/types';
import { PrintPageLayout, TitleBar } from './PrintComponents';
// FIX: Corrected import path for format utility
import { formatCurrency } from '../core/utils/format';

type QuoteTotals = any;

interface FinishesPrintModuleProps {
  quote: SavedQuote;
  totals: QuoteTotals;
  companyInfo: CompanyInfo;
}

const calculateRowArea = (row: AreaRow): number => {
  if (!row.dim1) return 0;
  switch (row.shape) {
    case 'full': return row.dim1;
    case 'half': return row.dim1 / 2;
    case 'third': return row.dim1 / 3;
    default: return 0;
  }
};

const ProjectInfoCard: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
    <div style={{ border: '0.5pt solid #ccc', padding: '3mm', borderRadius: '2mm', backgroundColor: '#f9fafb' }}>
        <p style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '1mm', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '12pt', fontWeight: 'bold', color: '#111827', lineHeight: 1.2 }}>{value}</p>
    </div>
);


// Page 1: Project Info
const PageOne: React.FC<{ quote: SavedQuote; companyInfo: CompanyInfo }> = ({ quote, companyInfo }) => (
  <PrintPageLayout quote={quote} companyInfo={companyInfo}>
    <TitleBar title="بيانات المشروع الأساسية" />
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm', marginBottom: '5mm' }}>
        <ProjectInfoCard label="اسم المشروع" value={quote.projectDetails.projectName || '-'} />
        <ProjectInfoCard label="اسم العميل" value={quote.projectDetails.customerName || '-'} />
        <ProjectInfoCard label="رقم الهاتف" value={quote.projectDetails.customerNumber || '-'} />
        <ProjectInfoCard label="المساحة الإجمالية" value={<>{quote.projectDetails.areaSize} م²</>} />
    </div>

    <TitleBar title="منهجية حساب الذرعة" />
    <p className="text-xs leading-relaxed">
        يتم حساب المساحة الإجمالية للبناء وفقاً لقواعد الذرعة الهندسية المعتمدة في شركتنا، حيث يتم احتساب المساحات المختلفة بنسب متفاوتة لضمان دقة التسعير وعدالته. يتم تطبيق النسب التالية على المساحات المدخلة في حاسبة الذرعة:
    </p>
    <ul className="list-disc pr-4 text-xs mt-2 space-y-1">
        <li><b>المساحات الكاملة (100%):</b> تشمل جميع السقوف المسكونة والدرج الداخلي.</li>
        <li><b>نصف المساحة (50%):</b> تشمل المناور، الكراجات المسقوفة، البيتونة، والمماشي الخارجية المسقوفة.</li>
        <li><b>ثلث الطول (33%):</b> تشمل الستائر والأسيجة الخارجية، حيث يتم تحويل طولها إلى مساحة مكافئة.</li>
    </ul>

    {quote.printSettings.showAreaBreakdown && quote.areaBreakdown && quote.areaBreakdown.length > 0 && (
      <>
        <TitleBar title="تفاصيل حساب الذرعة للمشروع الحالي" />
        <table className="doc-print-table w-full">
          <thead>
            <tr>
              <th className="w-1/2">البند</th>
              <th className="w-1/4 text-center">المعادلة</th>
              <th className="w-1/4 text-left">المساحة المحتسبة (م²)</th>
            </tr>
          </thead>
          <tbody>
            {quote.areaBreakdown.filter(r => r.dim1 > 0).map(row => {
              const rowArea = calculateRowArea(row);
              let calculationText = '';
              let unit = 'م²';
              switch (row.shape) {
                case 'full': calculationText = `${row.dim1} × 100%`; break;
                case 'half': calculationText = `${row.dim1} / 2`; break;
                case 'third': calculationText = `${row.dim1} / 3`; unit = 'م'; break;
              }
              return (
                <tr key={row.id}>
                  <td>{row.label}</td>
                  <td className="text-center font-mono">{calculationText.replace(String(row.dim1), `${row.dim1} ${unit}`)}</td>
                  <td className="text-left font-mono">{rowArea.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="font-black">الإجمالي</td>
              <td className="font-black text-left font-mono">{quote.projectDetails.areaSize.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </>
    )}

    {quote.projectDetails.enableSpaceDistribution && (
        <>
        <TitleBar title="توزيع فضاءات المشروع" />
         <table className="doc-print-table w-full">
            <thead>
                <tr>
                    <th className="w-2/3">الفضاء</th>
                    <th className="w-1/3 text-left">المساحة (م²)</th>
                </tr>
            </thead>
            <tbody>
                {(quote.projectDetails.spaces || []).map(space => (
                    <tr key={space.id}>
                        <td>{space.name}</td>
                        <td className="text-left font-mono">{space.weight.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </>
    )}
   
  </PrintPageLayout>
);

// Page 2: Specifications
const PageTwo: React.FC<{ quote: SavedQuote; companyInfo: CompanyInfo }> = ({ quote, companyInfo }) => {
    const technicalCategories = quote.categories.filter(c => !c.allowMultiple);
    const multiSelectCategories = quote.categories.filter(c => c.allowMultiple);
    
    return (
        <PrintPageLayout quote={quote} companyInfo={companyInfo}>
            <TitleBar title="المواصفات الفنية" />
            <table className="doc-print-table w-full">
                <thead>
                    <tr>
                        <th className="w-1/3">الفئة</th>
                        <th className="w-2/3">الاختيار</th>
                    </tr>
                </thead>
                <tbody>
                    {technicalCategories.map(cat => {
                        const selection = quote.selections[cat.id] as CategorySelection;
                        if (!selection) return null;

                        const hasOverrides = Object.keys(selection.overrides).length > 0;
                        const defaultOption = cat.options.find(o => o.id === selection.default);

                        let selectionText: React.ReactNode = defaultOption?.label || 'غير محدد';
                        if (hasOverrides) {
                            selectionText = (
                                <>
                                    <span className="font-bold">{defaultOption?.label} (الافتراضي)</span>
                                    <ul className="list-disc pr-4 mt-1 text-xs">
                                        {Object.entries(selection.overrides).map(([spaceId, optionId]) => {
                                            const space = quote.projectDetails.spaces?.find(s => s.id === spaceId);
                                            const option = cat.options.find(o => o.id === optionId);
                                            return <li key={spaceId}>{space?.name}: <span className="font-semibold">{option?.label}</span></li>
                                        })}
                                    </ul>
                                </>
                            )
                        }

                        return (
                            <tr key={cat.id}>
                                <td className="font-bold bg-slate-50">{cat.title}</td>
                                <td>{selectionText}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {multiSelectCategories.map(cat => {
                const selectedIds = (quote.selections[cat.id] as string[]) || [];
                const selectedOptions = cat.options.filter(opt => selectedIds.includes(opt.id));
                if (selectedOptions.length === 0) return null;
                
                return (
                    <React.Fragment key={cat.id}>
                        <TitleBar title={cat.title} />
                        <ul className="list-disc pr-5 text-xs space-y-1">
                            {selectedOptions.map(opt => <li key={opt.id}>{opt.label}</li>)}
                        </ul>
                    </React.Fragment>
                )
            })}
        </PrintPageLayout>
    );
};

// Page 3: Financials
const PageThree: React.FC<{ quote: SavedQuote; totals: QuoteTotals; companyInfo: CompanyInfo }> = ({ quote, totals, companyInfo }) => (
    <PrintPageLayout quote={quote} companyInfo={companyInfo}>
        <TitleBar title="تفاصيل السعر" />
        <table className="doc-print-table w-full">
            <tbody>
                <tr>
                    <td className="w-2/3 font-bold bg-slate-50">التكلفة الأساسية للإنهاءات</td>
                    <td className="w-1/3 text-left font-mono">{formatCurrency(totals.baseTotal)}</td>
                </tr>
                <tr>
                    <td className="font-bold bg-slate-50">مجموع الإضافات</td>
                    <td className="text-left font-mono">{formatCurrency(totals.grandTotal - totals.baseTotal)}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td className="font-black">الإجمالي النهائي</td>
                    <td className="font-black text-left font-mono">{formatCurrency(totals.grandTotal)} IQD</td>
                </tr>
            </tfoot>
        </table>

        {quote.printSettings.showPaymentSchedule && 
            <>
                <TitleBar title="جدول الدفعات المالية" />
                <table className="doc-print-table w-full">
                    <thead>
                        <tr>
                            <th className="w-3/5">المرحلة</th>
                            <th className="w-1/5 text-center">النسبة</th>
                            <th className="w-1/5 text-left">القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(quote.paymentSchedule || []).map(stage => (
                            <tr key={stage.id}>
                                <td>{stage.name}</td>
                                <td className="text-center font-mono">{stage.percentage}%</td>
                                <td className="text-left font-mono">{formatCurrency(totals.grandTotal * (stage.percentage / 100))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        }
    </PrintPageLayout>
);

// Page 4: Terms and Conditions
const PageFour: React.FC<{ quote: SavedQuote; companyInfo: CompanyInfo }> = ({ quote, companyInfo }) => (
    <PrintPageLayout quote={quote} companyInfo={companyInfo}>
        <TitleBar title="الشروط والأحكام" />
        <ol className="list-decimal pr-5 text-xs space-y-2">
            {(companyInfo.termsAndConditions || '').split('\n').map((line, index) => (
                line.trim() && <li key={index}>{line.trim().replace(/^\d+\.\s*/, '')}</li>
            ))}
        </ol>
    </PrintPageLayout>
);

export const FinishesPrintModule: React.FC<FinishesPrintModuleProps> = ({ quote, totals, companyInfo }) => {
  return (
    <>
      <PageOne quote={quote} companyInfo={companyInfo} />
      <PageTwo quote={quote} companyInfo={companyInfo} />
      <PageThree quote={quote} totals={totals} companyInfo={companyInfo} />
      {quote.printSettings.showTerms && <PageFour quote={quote} companyInfo={companyInfo} />}
    </>
  );
};