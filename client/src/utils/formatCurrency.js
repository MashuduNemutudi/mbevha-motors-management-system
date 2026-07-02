/**
 * utils/formatCurrency.js
 * Format a number as South African Rand.
 * e.g. 1500 → "R 1,500.00"
 */

export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatCurrencyRaw = (amount) => {
  const num = parseFloat(amount) || 0;
  return num.toFixed(2);
};
