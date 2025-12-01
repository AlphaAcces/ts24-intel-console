import React from 'react';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportCaseButton } from '../ExportCaseButton';
import type { CaseExportPayload } from '../../../domains/export/caseExport';
import type { CaseData } from '../../../types';

const mockedDeps = vi.hoisted(() => ({
  requestCaseExport: vi.fn(),
  downloadJsonExport: vi.fn(),
}));

vi.mock('../../../domains/api/client', () => ({
  requestCaseExport: mockedDeps.requestCaseExport,
}));

vi.mock('../../../domains/export/download', () => ({
  downloadJsonExport: mockedDeps.downloadJsonExport,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key,
  }),
}));

describe('ExportCaseButton', () => {
  const requestCaseExportMock = mockedDeps.requestCaseExport;
  const downloadJsonExportMock = mockedDeps.downloadJsonExport;
  const payload: CaseExportPayload = {
    caseId: 'tsl',
    format: 'json',
    generatedAt: '2025-01-05T00:00:00.000Z',
    source: 'api',
    case: {} as CaseData,
    events: [],
    kpis: null,
  };

  beforeEach(() => {
    requestCaseExportMock.mockReset();
    downloadJsonExportMock.mockReset();
  });

  it('triggers export flow on click', async () => {
    requestCaseExportMock.mockResolvedValue(payload);
    downloadJsonExportMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ExportCaseButton caseId="tsl" />);

    await user.click(screen.getByTestId('export-case-button'));

    await waitFor(() => {
      expect(requestCaseExportMock).toHaveBeenCalledWith('tsl');
      expect(downloadJsonExportMock).toHaveBeenCalledWith(payload);
    });
  });

  it('shows loading state while exporting', async () => {
    let resolveExport: (value: CaseExportPayload) => void;
    const pendingPromise = new Promise<CaseExportPayload>(resolve => {
      resolveExport = resolve;
    });
    requestCaseExportMock.mockReturnValue(pendingPromise);

    const user = userEvent.setup();
    render(<ExportCaseButton caseId="tsl" />);

    await user.click(screen.getByTestId('export-case-button'));

    expect(screen.getByTestId('export-case-button')).toBeDisabled();
    expect(screen.getByText('Exporting…')).toBeInTheDocument();

    resolveExport!(payload);
    await waitFor(() => expect(screen.getByTestId('export-case-button')).not.toBeDisabled());
  });

  it('shows error when export fails', async () => {
    requestCaseExportMock.mockRejectedValue(new Error('network'));

    const user = userEvent.setup();
    render(<ExportCaseButton caseId="tsl" />);

    await user.click(screen.getByTestId('export-case-button'));

    expect(await screen.findByTestId('export-case-error')).toHaveTextContent('Failed to export case. Please try again.');
  });
});
