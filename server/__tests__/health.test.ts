import { describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../app';

describe('Health endpoint', () => {
  it('returns ok status payload without auth', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      service: 'TS24 Intel Console',
      status: 'ok',
    });
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.version).toBe('string');
  });
});
