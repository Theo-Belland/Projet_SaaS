import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { visitModelMock, jwtMock } = vi.hoisted(() => ({
  visitModelMock: {
    create: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
  jwtMock: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

vi.mock('../models/Visit.js', () => ({
  default: visitModelMock,
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';

describe('Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('POST /api/stats/visit enregistre une visite', async () => {
    visitModelMock.create.mockResolvedValue({ _id: 'v1' });

    const response = await request(app)
      .post('/api/stats/visit')
      .send({ path: '/projects', referrer: 'https://google.com' });

    expect(visitModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/projects', referrer: 'https://google.com' })
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('GET /api/stats retourne 401 sans token', async () => {
    const response = await request(app).get('/api/stats');

    expect(response.status).toBe(401);
  });

  it('GET /api/stats retourne les statistiques pour un utilisateur connecté', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    visitModelMock.countDocuments.mockResolvedValue(12);
    visitModelMock.aggregate
      .mockResolvedValueOnce([{ _id: '2026-07-08', count: 2 }])
      .mockResolvedValueOnce([{ _id: '/', count: 4 }]);

    const response = await request(app)
      .get('/api/stats')
      .set('Authorization', 'valid-user-token');

    expect(response.status).toBe(200);
  });

  it('GET /api/stats retourne les statistiques si admin', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'admin' });
    visitModelMock.countDocuments.mockResolvedValue(42);
    visitModelMock.aggregate
      .mockResolvedValueOnce([{ _id: '2026-06-30', count: 5 }])
      .mockResolvedValueOnce([{ _id: '/projects', count: 10 }]);

    const response = await request(app)
      .get('/api/stats')
      .set('Authorization', 'valid-admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 42,
      visitsByDay: [{ _id: '2026-06-30', count: 5 }],
      topPages: [{ _id: '/projects', count: 10 }],
    });
  });
});
