
import { Category, SelectionState, ProjectDetails, QuoteType, CategorySelection } from '../types';
import { getConstantsForQuoteType } from '../constants';

export const calculateQuoteTotals = (
  categories: Category[],
  selections: SelectionState,
  projectDetails: ProjectDetails,
  quoteType: QuoteType
) => {
  const { areaSize, spaces = [] } = projectDetails;
  const constants = getConstantsForQuoteType(quoteType);
  const basePrice = projectDetails.basePricePerM2 ?? constants.BASE_PRICE;

  let grandTotal = 0;
  let baseTotal = 0;
  let finalPricePerM2 = 0;

  if (quoteType === 'structure') {
    const effectiveBasePrice = basePrice;
    baseTotal = effectiveBasePrice * areaSize;
    let addedPerM2Total = 0;
    let fixedCostTotal = 0;
    let percentageTotal = 0;
    let addedPerM2Rate = 0;

    categories.forEach(cat => {
        const selection = selections[cat.id];
        const selectedIds = Array.isArray(selection) ? selection : (selection ? [(selection as CategorySelection).default] : []);
        selectedIds.forEach(id => {
            const selectedOption = cat.options.find(o => o.id === id);
            if(selectedOption && selectedOption.cost > 0) {
              if (selectedOption.costType === 'per_m2' || !selectedOption.costType) {
                  addedPerM2Total += selectedOption.cost * areaSize;
                  addedPerM2Rate += selectedOption.cost;
              } else if (selectedOption.costType === 'fixed') {
                  fixedCostTotal += selectedOption.cost;
              }
            }
        });
    });

    finalPricePerM2 = effectiveBasePrice + addedPerM2Rate;
    const subtotal = baseTotal + addedPerM2Total + fixedCostTotal;

    categories.forEach(cat => {
        const selection = selections[cat.id];
        const selectedIds = Array.isArray(selection) ? selection : (selection ? [(selection as CategorySelection).default] : []);
        selectedIds.forEach(id => {
            const selectedOption = cat.options.find(o => o.id === id);
            if(selectedOption && selectedOption.cost > 0 && selectedOption.costType === 'percentage') {
                percentageTotal += subtotal * (selectedOption.cost / 100);
            }
        });
    });

    grandTotal = subtotal + percentageTotal;
    
    return { grandTotal, effectiveBasePrice, isSpecialConditionApplied: false, specialConditionReasons: [], baseTotal, finalPricePerM2 };

  } else { // Finishes logic
    
    const totalWeight = spaces.reduce((sum, s) => sum + (s.weight || 0), 0);
    const isValidWeight = Math.abs(totalWeight - 100) < 0.1 && spaces.length > 0;

    let perM2Adjustments = 0;
    let fixedAdditionsTotal = 0;

    categories.forEach(cat => {
      const selection = selections[cat.id];

      if (cat.allowMultiple) {
        if (Array.isArray(selection)) {
          selection.forEach(optionId => {
            const option = cat.options.find(o => o.id === optionId);
            if (option) fixedAdditionsTotal += option.cost;
          });
        }
      } else if (selection && typeof selection === 'object' && cat.options.length > 0) {
        const catSelection = selection as CategorySelection;
        const baselineOption = cat.options[0];

        if (isValidWeight) {
          // Space customization is active. Calculate the weighted cost and find the difference from the baseline.
          let actualWeightedCost = 0;
          spaces.forEach(space => {
            const spaceWeight = (space.weight || 0) / 100;
            const overrideId = catSelection.overrides[space.id];
            
            let costForThisSpace = 0;
            if (overrideId === '__EXCLUDE__') {
              costForThisSpace = 0;
            } else {
              const optionId = overrideId || catSelection.default;
              const selectedOption = cat.options.find(o => o.id === optionId) || baselineOption;
              costForThisSpace = selectedOption.cost;
            }
            actualWeightedCost += costForThisSpace * spaceWeight;
          });
          
          const categoryAdjustment = actualWeightedCost - baselineOption.cost;
          perM2Adjustments += categoryAdjustment;

        } else {
          // Simple logic: no space customization. Find the difference from baseline.
          const defaultOption = cat.options.find(o => o.id === catSelection.default) || baselineOption;
          const costDiff = defaultOption.cost - baselineOption.cost;
          perM2Adjustments += costDiff;
        }
      }
    });

    finalPricePerM2 = basePrice + perM2Adjustments;
    const totalCostFromM2 = finalPricePerM2 * areaSize;
    grandTotal = totalCostFromM2 + fixedAdditionsTotal;
    
    // The base total for display is always based on the original basePrice
    const basePriceComponentTotal = basePrice * areaSize;

    return { 
        grandTotal, 
        effectiveBasePrice: basePrice, // Always show the original base price in breakdown
        isSpecialConditionApplied: false, 
        specialConditionReasons: [], 
        baseTotal: basePriceComponentTotal,
        finalPricePerM2 
    };
  }
};
