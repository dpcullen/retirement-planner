export function formatCurrency(value, symbol = '$') {
  if (value == null || isNaN(value)) return `${symbol}0`;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${symbol}${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

export function formatCurrencyFull(value, symbol = '$') {
  if (value == null || isNaN(value)) return `${symbol}0`;
  const sign = value < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

export function formatAge(age) {
  return `Age ${age}`;
}

export function formatYear(year) {
  return year.toString();
}
