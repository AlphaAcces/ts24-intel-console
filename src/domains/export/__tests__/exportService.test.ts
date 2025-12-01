import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { downloadJsonExport } from '../download';
import type { CaseExportPayload } from '../caseExport';
import type { CaseData } from '../../../types';

let requestCaseExport: (id: string) => Promise<CaseExportPayload>;

beforeAll(async () => {
  const apiClient = await vi.importActual<typeof import('../../api/client')>('../../api/client');
  requestCaseExport = apiClient.requestCaseExport;
});

describe('Case export helpers', () => {
  const samplePayload: CaseExportPayload = {
    caseId: 'tsl',
    format: 'json',
    generatedAt: '2025-01-05T00:00:00.000Z',
    source: 'api',
    case: {} as CaseData,
    events: [],
    kpis: null,
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends POST request and returns export payload', async () => {
    const responseJson = vi.fn().mockResolvedValue({ export: samplePayload });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: responseJson,
      headers: {
        get: () => 'application/json',
      },
    });

    vi.stubGlobal('fetch', fetchMock);
    expect(globalThis.fetch).toBe(fetchMock);

    const result = await requestCaseExport('tsl');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/cases/tsl/export',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual(samplePayload);
  });

  it('invokes download flow for JSON payloads', () => {
    const link = document.createElement('a');
    const clickSpy = vi.spyOn(link, 'click').mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link);

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    const createObjectUrlSpy = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectUrlSpy = vi.fn();
    URL.createObjectURL = createObjectUrlSpy as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectUrlSpy as typeof URL.revokeObjectURL;

    downloadJsonExport(samplePayload, 'custom.json');

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(link.download).toBe('custom.json');
    expect(appendSpy).toHaveBeenCalledWith(link);
    expect(removeSpy).toHaveBeenCalledWith(link);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');

    // Restore globals mutated for the test
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
    createElementSpy.mockRestore();
  });
});
