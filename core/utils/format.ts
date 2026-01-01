
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount);
};
