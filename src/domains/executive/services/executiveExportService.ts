/**
 * Executive Export Service
 *
 * Encapsulates the asynchronous PDF export flow so UI layers can trigger an
 * executive report download without duplicating import/canvas logic.
 */

import type { RefObject } from 'react';
import type { ExecutiveSummaryData, Subject } from '../../../types';
import { CASE_METADATA } from '../../cases/caseMetadata';
import { buildExecutiveReportMetadata } from '../../../pdf/reportMetadata';

export interface ExecutiveExportChartRef {
  ref: RefObject<HTMLDivElement | null>;
  title: string;
}

interface ExportOptions {
  subject: Subject;
  caseId: string;
  caseName?: string;
  exportedBy?: string;
  classification?: string;
  reportVersion?: string;
  summary: ExecutiveSummaryData;
  charts: ExecutiveExportChartRef[];
}

export const exportExecutiveSummaryReport = async ({
  subject,
  caseId,
  caseName,
  exportedBy,
  classification,
  reportVersion,
  summary,
  charts,
}: ExportOptions): Promise<void> => {
  const [{ generateExecutiveReportPdf }, html2canvasModule, executiveModule] = await Promise.all([
    import('../../../pdf/executiveReport'),
    import('html2canvas'),
    import('../../../data/executive'),
  ]);

  const html2canvas = html2canvasModule.default;
  const exportPayload = executiveModule.createExecutiveExportPayload(subject, summary);
  const resolvedCaseId = caseId ?? subject;
  const resolvedCaseName =
    caseName ?? CASE_METADATA.find(meta => meta.id === resolvedCaseId)?.name ?? resolvedCaseId.toUpperCase();

  const snapshots = await Promise.all(
    charts.map(async ({ ref, title }) => {
      const element = ref.current;
      if (!element) {
        return null;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#0F172A',
        scale: Math.max(3, window.devicePixelRatio || 1),
      });

      return {
        title,
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      };
    })
  );

  const chartPayload = snapshots.filter(
    (snapshot): snapshot is { title: string; dataUrl: string; width: number; height: number } =>
      snapshot !== null
  );

  const metadata = buildExecutiveReportMetadata({
    caseId: resolvedCaseId,
    caseName: resolvedCaseName,
    subject,
    exportedBy,
    exportedAt: exportPayload.generatedAt,
    classification,
    reportVersion,
  });

  await generateExecutiveReportPdf(exportPayload, { charts: chartPayload, metadata });
};
