export function formatSavedMoney(value: number, currency: string): string {
  const amount = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (/^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency, currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(amount);
    } catch { /* A custom currency falls back to its saved label. */ }
  }
  return `${currency || '$'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatReclaimedTime(hours: number): string {
  const minutes = Math.floor(Math.max(0, Number.isFinite(hours) ? hours : 0) * 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
  const roundedHours = Math.round(minutes / 6) / 10;
  return `${roundedHours.toLocaleString()} ${roundedHours === 1 ? 'hr' : 'hrs'}`;
}
