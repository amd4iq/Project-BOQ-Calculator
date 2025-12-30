import { SavedQuote, QuoteType } from '../types';

/**
 * Generates a unique, sequential offer number based on the quote type and year.
 * Format: MB-TYPE-YYYY-XXXX
 * - TYPE is STR for structure, FIN for finishes.
 * - YYYY is the current year.
 * - XXXX is a 4-digit sequential number, resetting each year for each type.
 */
export const generateOfferNumber = (quoteType: QuoteType, allQuotes: SavedQuote[]): string => {
  const prefix = quoteType === 'structure' ? 'MB-STR' : 'MB-FIN';
  const currentYear = new Date().getFullYear();
  
  const yearPrefix = `${prefix}-${currentYear}`;

  const quotesThisYear = allQuotes.filter(q => q.offerNumber && q.offerNumber.startsWith(yearPrefix));
  
  const lastNumber = quotesThisYear.reduce((max, q) => {
    const parts = q.offerNumber.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    return num > max ? num : max;
  }, 0);

  const newNumber = lastNumber + 1;
  const newSequential = newNumber.toString().padStart(4, '0');

  return `${yearPrefix}-${newSequential}`;
};
