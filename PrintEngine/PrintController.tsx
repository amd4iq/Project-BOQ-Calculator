import React from 'react';
// FIX: Corrected import path for types
import { SavedQuote, CompanyInfo } from '../core/types';
import { StructurePrintModule } from './StructurePrintModule';
import { FinishesPrintModule } from './FinishesPrintModule';

interface PrintControllerProps {
  quote: SavedQuote | null;
  totals: any;
  companyInfo: CompanyInfo;
}

/**
 * PrintController: The main entry point for the print engine.
 * This component is rendered in the main App but is visually hidden.
 * Its content becomes visible only when the browser's print dialog is triggered.
 * It selects the appropriate print module based on the quote type.
 */
export const PrintController: React.FC<PrintControllerProps> = ({ quote, totals, companyInfo }) => {
  if (!quote || !totals) {
    return null;
  }

  return (
    <div className="hidden print:block">
      {quote.quoteType === 'structure' && (
        <StructurePrintModule quote={quote} totals={totals} companyInfo={companyInfo} />
      )}
      {quote.quoteType === 'finishes' && (
        <FinishesPrintModule quote={quote} totals={totals} companyInfo={companyInfo} />
      )}
    </div>
  );
};