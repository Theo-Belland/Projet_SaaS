import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { projectModelMock, jwtMock } = vi.hoisted(() => ({
  projectModelMock: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
  jwtMock: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

vi.mock('../models/Project.js', () => ({
  default: projectModelMock,
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  // --- Routes publiques ---

  it('GET /api/projects retourne les projets publiés', async () => {
    const sortMock = vi.fn().mockResolvedValue([{ _id: 'p1', title: 'Projet Test' }]);
    projectModelMock.find.mockReturnValue({ sort: sortMock });

    const response = await request(app).get('/api/projects');

    expect(projectModelMock.find).toHaveBeenCalledWith({ published: true });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ _id: 'p1', title: 'Projet Test' }]);
  });

  it('GET /api/projects/admin/all retourne tous les projets pour un utilisateur connecté', async () => {
    const sortMock = vi.fn().mockResolvedValue([
      { _id: 'p1', title: 'Projet publié' },
      { _id: 'p2', title: 'Projet brouillon' },
    ]);
    projectModelMock.find.mockReturnValue({ sort: sortMock });
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });

    const response = await request(app)
      .get('/api/projects/admin/all')
      .set('Authorization', 'valid-user-token');

    expect(projectModelMock.find).toHaveBeenCalledWith();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { _id: 'p1', title: 'Projet publié' },
      { _id: 'p2', title: 'Projet brouillon' },
    ]);
  });

  it('GET /api/projects/:id retourne le projet', async () => {
    projectModelMock.findById.mockResolvedValue({ _id: 'p1', title: 'Mon Projet' });

    const response = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ _id: 'p1', title: 'Mon Projet' });
  });

  it('GET /api/projects/:id retourne 404 si projet absent', async () => {
    projectModelMock.findById.mockResolvedValue(null);

    const response = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Projet introuvable' });
  });

  // --- Routes admin ---

  it('POST /api/projects retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({ title: 'Nouveau', description: 'Description' });

    expect(response.status).toBe(401);
  });

  it('POST /api/projects crée un projet pour un utilisateur connecté', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', 'valid-user-token')
      .send({ title: 'Nouveau', description: 'Description' });

    expect(response.status).toBe(201);
  });

  it('POST /api/projects crée un projet et retourne 201', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    projectModelMock.create.mockResolvedValue({ _id: 'p2', title: 'Nouveau' });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', 'valid-user-token')
      .send({ title: 'Nouveau', description: 'Description' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ _id: 'p2', title: 'Nouveau' });
  });

  it('POST /api/projects accepte une image uploadée', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    projectModelMock.create.mockResolvedValue({ _id: 'p3', title: 'Avec image' });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', 'valid-user-token')
      .field('title', 'Avec image')
      .field('description', 'Projet avec visuel')
      .attach('images', Buffer.from('fake-image-content-1'), 'image-1.png')
      .attach('images', Buffer.from('fake-image-content-2'), 'image-2.png');

    expect(response.status).toBe(201);
    expect(projectModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Avec image',
        description: 'Projet avec visuel',
        image: expect.stringMatching(/^\/uploads\/projects\//),
        images: expect.arrayContaining([
          expect.stringMatching(/^\/uploads\/projects\//),
          expect.stringMatching(/^\/uploads\/projects\//),
        ]),
      })
    );
  });

  it('PUT /api/projects/:id retourne 404 si projet absent', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    projectModelMock.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid-user-token')
      .send({ title: 'Mis à jour' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Projet introuvable' });
  });

  it('DELETE /api/projects/:id supprime le projet pour un utilisateur connecté', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'user' });
    projectModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'p1' });

    const response = await request(app)
      .delete('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid-user-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Projet supprimé' });
  });
});
