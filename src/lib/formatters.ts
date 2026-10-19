/**
 * Formateringshjälpmedel för svenska valutor, tal och areor.
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 kr';
  }
  return `${Math.round(amount).toLocaleString('sv-SE')} kr`;
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  return Math.round(value).toLocaleString('sv-SE');
}

export function formatArea(area: number): string {
  if (isNaN(area) || area === null || area === undefined) {
    return '0 m²';
  }
  return `${area.toLocaleString('sv-SE')} m²`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0 %';
  }
  return `${value.toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} %`;
}
