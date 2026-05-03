export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    return `${sign}Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: val % 1 === 0 ? 0 : 1 }).format(val)}M`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: val % 1 === 0 ? 0 : 1 }).format(val)}Jt`;
  }
  const val = abs / 1_000;
  return `${sign}Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: val % 1 === 0 ? 0 : 1 }).format(val)}K`;
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}
