import type { jsPDF } from 'jspdf';
import type { ReportTheme, ReportColor } from './reportTheme';

const FALLBACK_FONT = 'helvetica';

const toRgb = (doc: jsPDF, color: ReportColor) => {
  doc.setTextColor(color[0], color[1], color[2]);
};

export const applyPageBackground = (doc: jsPDF, theme: ReportTheme) => {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.setFillColor(theme.colors.background[0], theme.colors.background[1], theme.colors.background[2]);
  doc.rect(0, 0, width, height, 'F');
};

export const getContentStartY = (theme: ReportTheme): number => theme.layout.margin + theme.layout.lineHeight * 3.5;

export const getContentBottomY = (doc: jsPDF, theme: ReportTheme): number =>
  doc.internal.pageSize.getHeight() - theme.layout.margin - theme.layout.lineHeight;

export const ensureSectionSpace = (
  doc: jsPDF,
  currentY: number,
  required: number,
  theme: ReportTheme,
): number => {
  const limit = getContentBottomY(doc, theme);
  if (currentY + required > limit) {
    doc.addPage();
    applyPageBackground(doc, theme);
    return getContentStartY(theme);
  }
  return currentY;
};

export const drawSectionTitle = (
  doc: jsPDF,
  theme: ReportTheme,
  title: string,
  cursorY: number,
  subtitle?: string,
): number => {
  toRgb(doc, theme.colors.accent);
  doc.setFontSize(theme.typography.sectionTitle);
  doc.setFont(FALLBACK_FONT, 'bold');
  doc.text(title.toUpperCase(), theme.layout.margin, cursorY);

  let nextY = cursorY + theme.layout.lineHeight;
  if (subtitle) {
    toRgb(doc, theme.colors.textSecondary);
    doc.setFontSize(theme.typography.body);
    doc.setFont(FALLBACK_FONT, 'normal');
    doc.text(subtitle, theme.layout.margin, nextY);
    nextY += theme.layout.lineHeight;
  }

  doc.setDrawColor(theme.colors.divider[0], theme.colors.divider[1], theme.colors.divider[2]);
  doc.setLineWidth(0.6);
  doc.line(theme.layout.margin, nextY, doc.internal.pageSize.getWidth() - theme.layout.margin, nextY);
  toRgb(doc, theme.colors.textPrimary);
  doc.setFont(FALLBACK_FONT, 'normal');
  return nextY + theme.layout.sectionSpacing / 2;
};

export const drawKeyValueRow = (
  doc: jsPDF,
  theme: ReportTheme,
  x: number,
  y: number,
  label: string,
  value: string,
): number => {
  doc.setFontSize(theme.typography.small);
  doc.setFont(FALLBACK_FONT, 'bold');
  toRgb(doc, theme.colors.textMuted);
  doc.text(label.toUpperCase(), x, y);

  doc.setFontSize(theme.typography.body);
  doc.setFont(FALLBACK_FONT, 'normal');
  toRgb(doc, theme.colors.textPrimary);
  doc.text(value, x, y + theme.layout.lineHeight / 2 + 6);
  return y + theme.layout.lineHeight + 4;
};

export const drawBulletList = (
  doc: jsPDF,
  theme: ReportTheme,
  items: string[],
  startY: number,
  icon = '•',
): number => {
  let cursor = startY;
  const width = doc.internal.pageSize.getWidth() - theme.layout.margin * 2;
  items.forEach(item => {
    const lines = doc.splitTextToSize(item, width - 14);
    doc.setFontSize(theme.typography.body);
    doc.setFont(FALLBACK_FONT, 'bold');
    toRgb(doc, theme.colors.accent);
    doc.text(icon, theme.layout.margin, cursor);

    doc.setFont(FALLBACK_FONT, 'normal');
    toRgb(doc, theme.colors.textPrimary);
    lines.forEach((line: string, index: number) => {
      doc.text(line, theme.layout.margin + 12, cursor + index * theme.layout.lineHeight);
    });
    cursor += lines.length * theme.layout.lineHeight + 6;
  });
  return cursor;
};

export const drawDivider = (doc: jsPDF, theme: ReportTheme, y: number) => {
  doc.setDrawColor(theme.colors.divider[0], theme.colors.divider[1], theme.colors.divider[2]);
  doc.setLineWidth(0.7);
  doc.line(theme.layout.margin, y, doc.internal.pageSize.getWidth() - theme.layout.margin, y);
};
