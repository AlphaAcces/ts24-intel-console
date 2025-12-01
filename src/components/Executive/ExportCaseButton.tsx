import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { requestCaseExport } from '../../domains/api/client';
import { downloadJsonExport } from '../../domains/export/download';

interface ExportCaseButtonProps {
  caseId: string;
}

export const ExportCaseButton: React.FC<ExportCaseButtonProps> = ({ caseId }) => {
  const { t } = useTranslation('executive');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const payload = await requestCaseExport(caseId);
      downloadJsonExport(payload);
    } catch (err) {
      console.error('[ExportCaseButton]', err);
      setError(t('export.button.error.generic', {
        defaultValue: 'Failed to export case. Please try again.',
      }));
    } finally {
      setExporting(false);
    }
  };

  const label = exporting
    ? t('export.button.loading', { defaultValue: 'Exporting…' })
    : t('export.button.label', { defaultValue: 'Export case' });

  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        data-testid="export-case-button"
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-gold)]/50 bg-[var(--color-surface-hover)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-gold)] transition hover:border-[var(--color-gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40 disabled:opacity-60"
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{label}</span>
      </button>
      {error && (
        <p className="text-xs text-red-400" role="alert" data-testid="export-case-error">
          {error}
        </p>
      )}
    </div>
  );
};
