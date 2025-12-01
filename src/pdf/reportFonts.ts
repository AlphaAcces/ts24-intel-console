import type { jsPDF } from 'jspdf';

const INTER_FONT_VFS_NAME = 'Inter-Regular.ttf';
const INTER_FONT_NAME = 'Inter';

let interFontPayload: string | null = null;
let loader: (() => Promise<string>) | null = null;

export const configureInterFontLoader = (factory: () => Promise<string>) => {
  loader = factory;
};

const applyFontPayload = (doc: jsPDF, payload: string) => {
  doc.addFileToVFS(INTER_FONT_VFS_NAME, payload);
  doc.addFont(INTER_FONT_VFS_NAME, INTER_FONT_NAME, 'normal');
  doc.setFont(INTER_FONT_NAME, 'normal');
};

export const registerReportFonts = async (doc: jsPDF): Promise<void> => {
  if (!interFontPayload && loader) {
    try {
      interFontPayload = await loader();
    } catch (error) {
      console.warn('[ReportFonts] Failed to load Inter font payload.', error);
    }
  }

  if (interFontPayload) {
    applyFontPayload(doc, interFontPayload);
    return;
  }

  // TODO: Load base64 data from src/assets/fonts/Inter-Regular.ttf and call configureInterFontLoader
  // with a loader that reads the file (for example via fetch(new URL('../assets/fonts/Inter-Regular.ttf', import.meta.url))).
  doc.setFont('helvetica', 'normal');
};
