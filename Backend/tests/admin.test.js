import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { jwtMock } = vi.hoisted(() => ({
  jwtMock: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('GET /api/admin/admin-data retourne 401 sans token', async () => {
    const response = await request(app).get('/api/admin/admin-data');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token provided' });
  });

  it('GET /api/admin/admin-data retourne 401 si token invalide', async () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const response = await request(app)
      .get('/api/admin/admin-data')
      .set('Authorization', 'invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });

  it('GET /api/admin/admin-data retourne 403 si role non-admin', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });

    const response = await request(app)
      .get('/api/admin/admin-data')
      .set('Authorization', 'valid-user-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Access denied' });
  });

  it('GET /api/admin/admin-data retourne 200 si role admin', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u2', role: 'admin' });

    const response = await request(app)
      .get('/api/admin/admin-data')
      .set('Authorization', 'valid-admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'This is admin-only data' });
  });
});
