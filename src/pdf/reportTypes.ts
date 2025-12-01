import type { jsPDF } from 'jspdf';
import type { ExecutiveExportPayload } from '../types';
import type { ReportTheme } from './reportTheme';
import type { ExecutiveReportMetadata } from './reportMetadata';

export interface ExecutiveReportChart {
  title: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface SectionRenderParams {
  doc: jsPDF;
  theme: ReportTheme;
  payload: ExecutiveExportPayload;
  metadata: ExecutiveReportMetadata;
  charts?: ExecutiveReportChart[];
  cursorY: number;
}

export type SectionRenderer = (params: SectionRenderParams) => number;
