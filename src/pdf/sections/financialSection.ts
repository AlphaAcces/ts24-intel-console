import type { SectionRenderer } from '../reportTypes';
import { drawKeyValueRow, drawSectionTitle, ensureSectionSpace } from '../reportElements';
import { formatCurrency, formatDays, formatPercent } from '../reportFormatters';

const drawChart = (
  params: Parameters<SectionRenderer>[0],
  currentY: number,
): number => {
  const { doc, theme, charts } = params;
  const availableCharts = (charts ?? []).filter(chart => chart.dataUrl);
  let cursor = currentY;

  availableCharts.forEach(chart => {
    cursor = ensureSectionSpace(doc, cursor, chart.height + theme.layout.sectionSpacing, theme);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text(chart.title, theme.layout.margin, cursor);
    cursor += theme.layout.lineHeight;

    const maxWidth = doc.internal.pageSize.getWidth() - theme.layout.margin * 2;
    const ratio = chart.height / chart.width;
    const width = maxWidth;
    const height = width * ratio;

    doc.addImage(chart.dataUrl, 'PNG', theme.layout.margin, cursor, width, height, undefined, 'FAST');
    cursor += height + theme.layout.sectionSpacing / 2;
  });

  return cursor;
};

export const renderFinancialSection: SectionRenderer = params => {
  const { doc, theme, payload } = params;
  let currentY = ensureSectionSpace(doc, params.cursorY, theme.layout.sectionSpacing, theme);
  currentY = drawSectionTitle(doc, theme, 'Finansiel oversigt', currentY, 'Nøgletal og observationer');

  const pairs: Array<[string, string]> = [
    ['Seneste regnskabsår', payload.financial.latestYear ? String(payload.financial.latestYear) : 'N/A'],
    ['Bruttofortjeneste', formatCurrency(payload.financial.grossProfit)],
    ['Årets resultat', formatCurrency(payload.financial.profitAfterTax)],
    ['YOY brutto', formatPercent(payload.financial.yoyGrossChange)],
    ['YOY resultat', formatPercent(payload.financial.yoyProfitChange)],
    ['Likviditet', formatCurrency(payload.financial.liquidity)],
    ['DSO', formatDays(payload.financial.dso)],
    ['Intercompany', formatCurrency(payload.financial.intercompanyLoans)],
  ];

  pairs.forEach(([label, value]) => {
    currentY = ensureSectionSpace(doc, currentY, theme.layout.lineHeight * 2, theme);
    currentY = drawKeyValueRow(doc, theme, theme.layout.margin, currentY, label, value);
  });

  if (payload.financial.alerts.length > 0) {
    const alertTexts = payload.financial.alerts.map(alert => {
      const unit = alert.unit === 'DKK' ? formatCurrency(alert.value) : formatDays(alert.value);
      return `${alert.label}: ${unit} — ${alert.description}`;
    });
    currentY += theme.layout.lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text('Observationer', theme.layout.margin, currentY);
    currentY += theme.layout.lineHeight;
    alertTexts.forEach(text => {
      currentY = ensureSectionSpace(doc, currentY, theme.layout.lineHeight * 2, theme);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(theme.typography.body);
      doc.text(`• ${text}`, theme.layout.margin, currentY);
      currentY += theme.layout.lineHeight + 4;
    });
  }

  currentY = drawChart(params, currentY);
  return currentY + theme.layout.sectionSpacing;
};
