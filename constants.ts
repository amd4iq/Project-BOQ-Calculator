
import { QuoteType } from './types';
import * as structureConstants from './constants/structure';
import * as finishesConstants from './constants/finishes';

export const getConstantsForQuoteType = (quoteType: QuoteType) => {
  if (quoteType === 'finishes') {
    return finishesConstants;
  }
  return structureConstants;
};
