import { ExportPayload } from '../types';

const excelRenderer = {
  async renderExcel(payload: ExportPayload): Promise<Uint8Array> {
    // Minimal stub: return CSV-like bytes for now; replace with XLSX generation later.
    const rows = ['id,label,ai_score,ai_category'];
    (payload.nodes || []).forEach(n => {
      rows.push(`${n.id},"${n.label ?? ''}",${n.ai?.score ?? ''},${n.ai?.category ?? ''}`);
    });
    return new TextEncoder().encode(rows.join('\n'));
  },
};

export default excelRenderer;
