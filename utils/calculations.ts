
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
    
    // --- New Logic: Dynamically create spaces based on activeLevels ---
    const spacesForCalc: Space[] = [];
    let totalAllocatedWeight = 0;
    const activeLevels = projectDetails.activeLevels || [];

    activeLevels.forEach(levelId => {
      const levelNumber = parseInt(levelId.split('-')[1]);
      if (!isNaN(levelNumber)) {
        const weight = levelNumber * 10;
        spacesForCalc.push({ id: levelId, name: `المستوى ${levelNumber}`, weight });
        totalAllocatedWeight += weight;
      }
    });

    if (totalAllocatedWeight < 100) {
      spacesForCalc.push({ id: 'default-remainder', name: 'باقي المستويات', weight: 100 - totalAllocatedWeight });
    }
    // --- End of New Logic ---

    const totalWeight = spacesForCalc.reduce((sum, s) => sum + (s.weight || 0), 0);
    const isValidWeight = Math.abs(totalWeight - 100) < 0.1 && spacesForCalc.length > 0;

    let perM2Adjustments = 0;
    let fixedAdditionsTotal = 0;
    const spaceCosts: Record<string, number> = {};

    // First, calculate actual total cost based on selections
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
          let actualWeightedCost = 0;
          spacesForCalc.forEach(space => {
            const spaceWeight = (space.weight || 0) / 100;
            // For remainder, use default. For others, check override.
            const isRemainder = space.id === 'default-remainder';
            const overrideId = isRemainder ? undefined : catSelection.overrides[space.id];
            
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

        } else { // Fallback for when weights are not 100% (should not happen with new logic)
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

    // Second, determine the value for spaceCosts for UI display
    if (projectDetails.enableBudgeting && projectDetails.targetBudget && projectDetails.targetBudget > 0) {
      // Logic: If budgeting is on, space cost is proportional to the target budget
      (projectDetails.spaces || []).forEach(space => {
        spaceCosts[space.id] = 0; // Reset
      });
      activeLevels.forEach(levelId => {
         const levelNumber = parseInt(levelId.split('-')[1]);
         const weight = levelNumber * 10;
         spaceCosts[levelId] = projectDetails.targetBudget! * (weight / 100);
      })

    } else {
      // Logic: If budgeting is off, calculate actual cost per space based on selections
      spacesForCalc.forEach(space => {
          const spaceArea = (space.weight / 100) * areaSize;
          spaceCosts[space.id] = basePrice * spaceArea;
      });

      categories.forEach(cat => {
        if (cat.allowMultiple || !cat.options.length) return;

        const selection = selections[cat.id];
        if (selection && typeof selection === 'object' && !Array.isArray(selection)) {
          const catSelection = selection as CategorySelection;
          const baselineOption = cat.options[0];

          if (isValidWeight) {
            spacesForCalc.forEach(space => {
              const spaceWeight = (space.weight || 0) / 100;
              const isRemainder = space.id === 'default-remainder';
              const overrideId = isRemainder ? undefined : catSelection.overrides[space.id];

              let costForThisSpace = 0;
              if (overrideId === '__EXCLUDE__') {
                costForThisSpace = 0;
              } else {
                const optionId = overrideId || catSelection.default;
                const selectedOption = cat.options.find(o => o.id === optionId) || baselineOption;
                costForThisSpace = selectedOption.cost;
              }
              const costDiff = costForThisSpace - baselineOption.cost;
              const spaceArea = spaceWeight * areaSize;
              spaceCosts[space.id] += costDiff * spaceArea;
            });
          }
        }
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
