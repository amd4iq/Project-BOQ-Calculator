
import { QuoteType } from './types.ts';
import * as structureConstants from './constants/structure.ts';
import * as finishesConstants from './constants/finishes.ts';

export const getConstantsForQuoteType = (quoteType: QuoteType) => {
  if (quoteType === 'finishes') {
    return finishesConstants;
  }
  return structureConstants;
};
