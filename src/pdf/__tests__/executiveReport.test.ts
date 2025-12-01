import { describe, expect, it, vi } from 'vitest';
import type { ExecutiveExportPayload } from '../../types';
import { generateExecutiveReportPdf } from '../executiveReport';
import { buildExecutiveReportMetadata } from '../reportMetadata';
import { buildReportFilename } from '../reportFilename';

class MockJsPDF {
  internal = {
    pageSize: {
      getWidth: () => this.width,
      getHeight: () => this.height,
    },
  };

  private width = 595.28;

  private height = 841.89;

  private pageCount = 1;

  // Core API stubs
  setFont() {}

  setFontSize() {}

  setTextColor() {}

  setFillColor() {}

  setDrawColor() {}

  setLineWidth() {}

  rect() {}

  line() {}

  addImage() {}

  text() {}

  splitTextToSize(text: string | string[], _width?: number) {
    void _width;
    return Array.isArray(text) ? text : [text];
  }

  addPage() {
    this.pageCount += 1;
  }

  getNumberOfPages() {
    return this.pageCount;
  }

  setPage() {}

  setProperties() {}

  addFileToVFS() {}

  addFont() {}

  save() {}

  setFontStyle() {}

  getFontSize() {
    return 10;
  }
 }

vi.mock('jspdf', () => ({
  jsPDF: MockJsPDF,
}));

const samplePayload: ExecutiveExportPayload = {
  subject: 'tsl',
  generatedAt: '2025-11-30T10:00:00.000Z',
  financial: {
    latestYear: 2024,
    grossProfit: 12000000,
    profitAfterTax: 4200000,
    yoyGrossChange: 3.2,
    yoyProfitChange: -1.1,
    dso: 48,
    liquidity: 1800000,
    intercompanyLoans: 900000,
    alerts: [],
  },
  risk: {
    taxCaseExposure: null,
    complianceIssue: 'Ingen kritiske registreringer.',
    sectorRiskSummary: 'Stabil udvikling inden for transportsektoren.',
    riskScores: [],
    redFlags: [],
  },
  actions: {
    upcomingDeadlines: [],
    boardActionables: [],
    criticalEvents: [],
    upcomingEvents: [],
  },
};

describe('Executive report PDF', () => {
  it('generates a PDF without throwing', async () => {
    const metadata = buildExecutiveReportMetadata({
      caseId: 'tsl-001',
      caseName: 'TS Logistik ApS',
      subject: 'tsl',
    });

    await expect(
      generateExecutiveReportPdf(samplePayload, {
        metadata,
        charts: [],
      }),
    ).resolves.not.toThrow();
  });

  it('derives filenames using case, version, and date', () => {
    const metadata = buildExecutiveReportMetadata({
      caseId: 'umit-2024',
      caseName: 'Ümit Cetin',
      subject: 'umit',
      reportVersion: 'v2',
      exportedAt: '2025-11-30T22:00:00.000Z',
    });

    expect(buildReportFilename(metadata)).toBe('UMIT-2024_ExecutiveSummary_v2_2025-11-30.pdf');
  });
});
