
import { Category, SelectionState, ProjectDetails, QuoteType, CategorySelection, Space } from '../types';
import { getConstantsForQuoteType } from '../constants';

export const calculateQuoteTotals = (
  categories: Category[],
  selections: SelectionState,
  projectDetails: ProjectDetails,
  quoteType: QuoteType
) => {
  const { areaSize } = projectDetails;
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
    
    return { grandTotal, effectiveBasePrice, isSpecialConditionApplied: false, specialConditionReasons: [], baseTotal, finalPricePerM2, spaceCosts: {} };

  } else { // Finishes logic
    
    const mode = projectDetails.specAllocationMode || (projectDetails.enableSpaceDistribution ? 'spaces' : 'percentage');
    const isAllocated = projectDetails.enableSpaceDistribution;
    
    // --- MODE: SPACES ---
    const spacesForCalc: Space[] = projectDetails.spaces || [];
    const totalWeight = spacesForCalc.reduce((sum, s) => sum + (s.weight || 0), 0);
    const isValidSpaceCalc = isAllocated && mode === 'spaces' && Math.abs(totalWeight - projectDetails.areaSize) < 0.1 && spacesForCalc.length > 0;

    let perM2Adjustments = 0;
    let fixedAdditionsTotal = 0;
    const spaceCosts: Record<string, number> = {};

    categories.forEach(cat => {
      const selection = selections[cat.id];

      if (cat.allowMultiple) {
        // Handle Fixed Additions & Multi-select categories
        if (Array.isArray(selection)) {
          selection.forEach(optionId => {
            const option = cat.options.find(o => o.id === optionId);
            if (option) fixedAdditionsTotal += option.cost;
          });
        }
      } else if (selection && typeof selection === 'object' && cat.options.length > 0) {
        const catSelection = selection as CategorySelection;
        const baselineOption = cat.options[0]; // Usually cost 0 or low (The standard spec included in Base Price)
        
        // Mode 1: Spaces (Calculate Weighted Average based on Area)
        if (isValidSpaceCalc) {
          let actualWeightedCost = 0;
          spacesForCalc.forEach(space => {
            const spaceWeightPercentage = (space.weight || 0) / totalWeight;
            const overrideId = catSelection.overrides[space.id];
            
            let costForThisSpace = 0;
            if (overrideId === '__EXCLUDE__') {
              costForThisSpace = 0;
            } else {
              const optionId = overrideId || catSelection.default;
              const selectedOption = cat.options.find(o => o.id === optionId) || baselineOption;
              costForThisSpace = selectedOption.cost;
            }
            actualWeightedCost += costForThisSpace * spaceWeightPercentage;
          });
          
          const categoryAdjustment = actualWeightedCost - baselineOption.cost;
          perM2Adjustments += categoryAdjustment;

        } 
        // Mode 2: Percentage (Weighted Average based on User Input)
        else if (isAllocated && mode === 'percentage') {
            let weightedCost = 0;
            let totalExplicitPercent = 0;
            const percentages = catSelection.percentages || {};

            // 1. Calculate weighted cost for explicitly weighted options (User Inputs)
            Object.entries(percentages).forEach(([optId, pct]) => {
                // Ignore the default option key if present in map (to avoid double counting, though UI handles this)
                if (optId === catSelection.default) return; 
                
                const opt = cat.options.find(o => o.id === optId);
                if (opt && pct > 0) {
                    weightedCost += opt.cost * (pct / 100);
                    totalExplicitPercent += pct;
                }
            });

            // 2. Calculate remaining cost for the Default Option
            const remainingPercent = Math.max(0, 100 - totalExplicitPercent);
            const defaultOpt = cat.options.find(o => o.id === catSelection.default) || baselineOption;
            weightedCost += defaultOpt.cost * (remainingPercent / 100);

            // 3. The adjustment is the difference between this "Weighted Average Cost" and the Baseline Cost
            // This ensures correct addition to the Base Price.
            // Example: BasePrice includes Basic (5000). 
            // WeightedCost comes out to 6500.
            // Adjustment = 6500 - 5000 = 1500.
            // Final Price = BasePrice + 1500.
            const categoryAdjustment = weightedCost - baselineOption.cost;
            perM2Adjustments += categoryAdjustment;
        }
        // Mode 3: Standard (Simple Default Selection)
        else {
          const defaultOption = cat.options.find(o => o.id === catSelection.default) || baselineOption;
          const costDiff = defaultOption.cost - baselineOption.cost;
          perM2Adjustments += costDiff;
        }
      }
    });

    finalPricePerM2 = basePrice + perM2Adjustments;
    const totalCostFromM2 = finalPricePerM2 * areaSize;
    grandTotal = totalCostFromM2 + fixedAdditionsTotal;
    const basePriceComponentTotal = basePrice * areaSize;

    // Calculate individual space costs only if in space mode
    if (isValidSpaceCalc) {
      spacesForCalc.forEach(space => {
        const spaceArea = space.weight;
        let perM2CostForSpace = basePrice;
        
        categories.forEach(cat => {
            if (cat.allowMultiple || !cat.options.length) return;
            const selection = selections[cat.id] as CategorySelection;
            const baselineOption = cat.options[0];

            if (selection) {
                const overrideId = selection.overrides[space.id];
                const optionId = overrideId || selection.default;
                
                if (optionId === '__EXCLUDE__') {
                    perM2CostForSpace -= baselineOption.cost;
                } else {
                    const selectedOption = cat.options.find(o => o.id === optionId) || baselineOption;
                    const costDiff = selectedOption.cost - baselineOption.cost;
                    perM2CostForSpace += costDiff;
                }
            }
        });
        spaceCosts[space.id] = perM2CostForSpace * spaceArea;
      });
    }
    
    return { 
        grandTotal, 
        effectiveBasePrice: basePrice, 
        isSpecialConditionApplied: false, 
        specialConditionReasons: [], 
        baseTotal: basePriceComponentTotal,
        finalPricePerM2,
        spaceCosts
    };
  }
};
