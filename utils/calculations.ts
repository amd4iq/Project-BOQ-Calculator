import { Category, SelectionState } from '../types';
import { BASE_PRICE } from '../constants';

export const calculateQuoteTotals = (
  categories: Category[],
  selections: SelectionState,
  areaSize: number
) => {
  const baseTotal = BASE_PRICE * areaSize;
  let addedPerM2Total = 0;
  let fixedCostTotal = 0;
  let percentageTotal = 0;

  // Pass 1: Fixed and Per M2
  categories.forEach(cat => {
      const selection = selections[cat.id];
      const selectedIds = Array.isArray(selection) ? selection : (selection ? [selection] : []);

      selectedIds.forEach(id => {
          const selectedOption = cat.options.find(o => o.id === id);
          if(selectedOption && selectedOption.cost > 0) {
            if (selectedOption.costType === 'per_m2' || !selectedOption.costType) {
                addedPerM2Total += selectedOption.cost * areaSize;
            } else if (selectedOption.costType === 'fixed') {
                fixedCostTotal += selectedOption.cost;
            }
          }
      });
  });

  const subtotal = baseTotal + addedPerM2Total + fixedCostTotal;

  // Pass 2: Percentage
  categories.forEach(cat => {
      const selection = selections[cat.id];
      const selectedIds = Array.isArray(selection) ? selection : (selection ? [selection] : []);

      selectedIds.forEach(id => {
          const selectedOption = cat.options.find(o => o.id === id);
          if(selectedOption && selectedOption.cost > 0 && selectedOption.costType === 'percentage') {
              percentageTotal += subtotal * (selectedOption.cost / 100);
          }
      });
  });

  const grandTotal = subtotal + percentageTotal;

  return { grandTotal };
};