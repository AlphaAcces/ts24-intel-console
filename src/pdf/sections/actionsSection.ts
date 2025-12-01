import type { SectionRenderer } from '../reportTypes';
import { drawBulletList, drawSectionTitle, ensureSectionSpace } from '../reportElements';

const buildActionText = (
  title: string,
  owner?: string,
  horizon?: string,
  extra?: string,
) => `${title} · ${owner ?? 'Ukendt ansvarlig'} · ${horizon ?? 'Ukendt horisont'}${extra ? ` — ${extra}` : ''}`;

export const renderActionsSection: SectionRenderer = ({ doc, theme, payload, cursorY }) => {
  let currentY = ensureSectionSpace(doc, cursorY, theme.layout.sectionSpacing, theme);
  currentY = drawSectionTitle(doc, theme, 'Action radar / handlinger', currentY, 'Deadlines og anbefalinger');

  const deadlines = payload.actions.upcomingDeadlines.map(item =>
    buildActionText(item.title, item.ownerRole, item.timeHorizon, item.description)
  );
  if (deadlines.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text('0-30 dage', theme.layout.margin, currentY);
    currentY = drawBulletList(doc, theme, deadlines, currentY + theme.layout.lineHeight, '⏱');
  }

  const boardItems = payload.actions.boardActionables.map(item =>
    buildActionText(item.title, item.ownerRole, item.timeHorizon, item.description)
  );
  if (boardItems.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(theme.typography.body);
    doc.text('Board actionables', theme.layout.margin, currentY);
    currentY = drawBulletList(doc, theme, boardItems, currentY + theme.layout.lineHeight, '🏛');
  }

  return currentY + theme.layout.sectionSpacing;
};
