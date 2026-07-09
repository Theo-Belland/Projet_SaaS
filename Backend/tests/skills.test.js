import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { skillModelMock, jwtMock } = vi.hoisted(() => ({
  skillModelMock: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
  jwtMock: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

vi.mock('../models/Skill.js', () => ({
  default: skillModelMock,
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';

describe('Skills API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('GET /api/skills retourne toutes les compétences', async () => {
    const sortMock = vi.fn().mockResolvedValue([
      { _id: 's1', name: 'React', category: 'frontend', level: 90 },
    ]);
    skillModelMock.find.mockReturnValue({ sort: sortMock });

    const response = await request(app).get('/api/skills');

    expect(skillModelMock.find).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('POST /api/skills retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/skills')
      .send({ name: 'Vue', category: 'frontend' });

    expect(response.status).toBe(401);
  });

  it('POST /api/skills crée une compétence pour un utilisateur connecté', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    skillModelMock.create.mockResolvedValue({ _id: 's2', name: 'Vue', category: 'frontend' });

    const response = await request(app)
      .post('/api/skills')
      .set('Authorization', 'valid-user-token')
      .send({ name: 'Vue', category: 'frontend', level: 80 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ _id: 's2', name: 'Vue', category: 'frontend' });
  });

  it('PUT /api/skills/:id retourne 404 si compétence absente', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    skillModelMock.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put('/api/skills/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid-user-token')
      .send({ level: 90 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Compétence introuvable' });
  });

  it('DELETE /api/skills/:id supprime la compétence pour un utilisateur connecté', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    skillModelMock.findByIdAndDelete.mockResolvedValue({ _id: 's1' });

    const response = await request(app)
      .delete('/api/skills/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid-user-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Compétence supprimée' });
  });
});
