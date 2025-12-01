import type { SectionRenderer } from '../reportTypes';
import { drawBulletList, drawSectionTitle, ensureSectionSpace } from '../reportElements';

const buildSummaryBullets = (payload: Parameters<SectionRenderer>[0]['payload']): string[] => {
  const bullets: string[] = [];
  const boardActions = payload.actions.boardActionables.slice(0, 2);
  const deadlines = payload.actions.upcomingDeadlines.slice(0, 2);
  const redFlags = payload.risk.redFlags.slice(0, 1);

  boardActions.forEach(action => {
    bullets.push(`${action.title} · ${action.priority} · ${action.ownerRole ?? 'Uden ejer'}`);
  });

  deadlines.forEach(deadline => {
    bullets.push(`${deadline.title} · Horisont: ${deadline.timeHorizon ?? 'N/A'}`);
  });

  redFlags.forEach(flag => {
    bullets.push(`Advarsel: ${flag.id} (${flag.unit})`);
  });

  return bullets.length > 0 ? bullets : ['Ingen kritiske observationer rapporteret.'];
};

export const renderExecutiveSummarySection: SectionRenderer = ({ doc, theme, payload, cursorY }) => {
  let currentY = ensureSectionSpace(doc, cursorY, theme.layout.sectionSpacing, theme);
  currentY = drawSectionTitle(doc, theme, 'Executive Summary / Konklusioner', currentY, 'Konklusioner & anbefalinger');
  const bullets = buildSummaryBullets(payload);
  currentY = drawBulletList(doc, theme, bullets, currentY);
  return currentY + theme.layout.sectionSpacing;
};
