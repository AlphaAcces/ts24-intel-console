import type { SectionRenderer } from '../reportTypes';
import { drawBulletList, drawSectionTitle, ensureSectionSpace } from '../reportElements';
import { formatTimelineEntry } from '../reportFormatters';

export const renderTimelineSection: SectionRenderer = ({ doc, theme, payload, cursorY }) => {
  let currentY = ensureSectionSpace(doc, cursorY, theme.layout.sectionSpacing, theme);
  currentY = drawSectionTitle(doc, theme, 'Tidslinje / hændelser', currentY, 'Kritiske hændelser');

  const critical = payload.actions.criticalEvents.map(event => formatTimelineEntry(event.date, event.title, event.description));
  const upcoming = payload.actions.upcomingEvents.map(event => formatTimelineEntry(event.date, event.title, event.description));

  if (critical.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text('Kritiske hændelser', theme.layout.margin, currentY);
    currentY = drawBulletList(doc, theme, critical, currentY + theme.layout.lineHeight, '⚡');
  }

  if (upcoming.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text('Kommende hændelser', theme.layout.margin, currentY);
    currentY = drawBulletList(doc, theme, upcoming, currentY + theme.layout.lineHeight, '🗓');
  }

  return currentY + theme.layout.sectionSpacing;
};
