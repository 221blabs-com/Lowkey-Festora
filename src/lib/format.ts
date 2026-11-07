/** Indian-system grouping (1,00,000) — matches how the organisers write amounts. */
const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (amount: number) => `₹${inr.format(amount)}`;
export const formatNumberIN = (value: number) => inr.format(value);
