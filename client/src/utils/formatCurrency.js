export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `R ${num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyRaw = (amount) => {
  const num = parseFloat(amount) || 0;
  return num.toFixed(2);
};
