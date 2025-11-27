import orchestrator from '../services/exportOrchestrator';

describe('ExportOrchestrator', () => {
  it('forwards payload to pdf renderer and returns bytes', async () => {
    const payload = {
      tenant: { id: 't1', name: 'Tenant 1' },
      aiOverlay: { enabled: true, sensitivity: 0.5, categories: ['risk'] },
      nodes: [{ id: 'n1', label: 'Node 1', ai: { score: 0.8, category: 'risk' } }],
    } as any;
    const out = await orchestrator.export(payload, 'pdf');
    expect(out).toBeInstanceOf(Uint8Array);
  });

  it('returns JSON for json format', async () => {
    const payload = { tenant: { id: 't2' }, aiOverlay: null } as any;
    const out = await orchestrator.export(payload, 'json');
    expect(typeof out).toBe('string');
    const parsed = JSON.parse(out as string);
    expect(parsed.tenant.id).toBe('t2');
  });
});
