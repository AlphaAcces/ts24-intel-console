const currencyFormatter = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 });

export const formatCurrency = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return 'Ikke tilgængelig';
  }
  return currencyFormatter.format(value);
};

export const formatPercent = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatDays = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value} dage`;
};

export const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('da-DK', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTimelineEntry = (date: string, title: string, description?: string): string => {
  const base = `${formatDate(date)} · ${title}`;
  return description ? `${base} — ${description}` : base;
};
