import type { CaseExportPayload } from './caseExport';

export function downloadJsonExport(payload: CaseExportPayload, filename?: string) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename ?? `case-export-${payload.caseId}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
