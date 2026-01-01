
import { SavedQuote, Category, CategorySelection } from '../types.ts';
import { getConstantsForQuoteType } from '../constants.ts';

export const downloadJSON = (data: object, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadCSV = (quote: SavedQuote, totalUnitPrice: number, totalPrice: number) => {
  const constants = getConstantsForQuoteType(quote.quoteType);
  const { BASE_PRICE } = constants;

  // UTF-8 BOM for Excel Arabic support
  const BOM = "\uFEFF"; 
  let csvContent = BOM;

  // Header Info
  csvContent += `اسم المشروع,${quote.projectDetails.projectName}\n`;
  csvContent += `اسم الزبون,${quote.projectDetails.customerName}\n`;
  csvContent += `التاريخ,${quote.projectDetails.date}\n`;
  csvContent += `المساحة (م2),${quote.projectDetails.areaSize}\n\n`;

  // Table Headers
  csvContent += `المادة,التفاصيل,السعر المضاف\n`;
  
  // Base Price
  csvContent += `السعر الأساسي,سعر المتر المربع الأساسي,${BASE_PRICE}\n`;

  // Categories
  quote.categories.forEach(cat => {
    const selection = quote.selections[cat.id];
    
    if (cat.allowMultiple) {
      const selectedIds = (selection as string[]) || [];
      selectedIds.forEach(id => {
        const option = cat.options.find(o => o.id === id);
        if (option) {
          csvContent += `"${cat.title}","${option.label}",${option.cost}\n`;
        }
      });
    } else {
      const catSelection = selection as CategorySelection;
      if (catSelection && catSelection.default) {
        const option = cat.options.find(o => o.id === catSelection.default);
        if (option) {
            csvContent += `"${cat.title}","${option.label}",${option.cost}\n`;
        }
      }
    }
  });

  csvContent += `\n`;
  csvContent += `سعر المتر المربع النهائي,,${totalUnitPrice}\n`;
  csvContent += `السعر الإجمالي الكلي,,${totalPrice}\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BOQ-${quote.projectDetails.projectName || 'Project'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
