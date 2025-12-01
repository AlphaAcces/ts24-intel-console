import type { SectionRenderer } from '../reportTypes';
import { drawBulletList, drawSectionTitle, ensureSectionSpace } from '../reportElements';
import { formatCurrency } from '../reportFormatters';

export const renderRiskSection: SectionRenderer = ({ doc, theme, payload, cursorY }) => {
  let currentY = ensureSectionSpace(doc, cursorY, theme.layout.sectionSpacing, theme);
  currentY = drawSectionTitle(doc, theme, 'Risiko & compliance', currentY, 'Kategoriserede risici');

  payload.risk.riskScores.forEach(score => {
    currentY = ensureSectionSpace(doc, currentY, theme.layout.lineHeight * 3, theme);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text(`${score.category} · ${score.riskLevel}`, theme.layout.margin, currentY);
    currentY += theme.layout.lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(theme.typography.body);
    const lines = doc.splitTextToSize(score.justification ?? 'Ingen beskrivelse', doc.internal.pageSize.getWidth() - theme.layout.margin * 2);
    lines.forEach((line: string, index: number) => {
      doc.text(line, theme.layout.margin, currentY + index * theme.layout.lineHeight);
    });
    currentY += lines.length * theme.layout.lineHeight + theme.layout.lineHeight / 2;
  });

  if (payload.risk.redFlags.length > 0) {
    const flags = payload.risk.redFlags.map(flag => {
      const value = flag.unit === 'DKK' ? formatCurrency(flag.value) : `${flag.value ?? 'N/A'} ${flag.unit}`;
      return `${flag.id.toUpperCase()}: ${value}`;
    });
    currentY = drawBulletList(doc, theme, flags, currentY + theme.layout.lineHeight, '⚠');
  }

  return currentY + theme.layout.sectionSpacing;
};
