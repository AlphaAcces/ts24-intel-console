import type { ExecutiveReportMetadata } from './reportMetadata';

export const buildReportFilename = (metadata: ExecutiveReportMetadata): string => {
  const date = metadata.exportedAt.slice(0, 10);
  const caseSlug = metadata.caseId.toUpperCase();
  return `${caseSlug}_ExecutiveSummary_${metadata.reportVersion}_${date}.pdf`;
};
