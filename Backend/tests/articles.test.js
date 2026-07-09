import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { articleModelMock, jwtMock } = vi.hoisted(() => ({
  articleModelMock: {
    find: vi.fn(),
    findOne: vi.fn(),
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

vi.mock('../models/Article.js', () => ({
  default: articleModelMock,
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';

describe('Articles API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('GET /api/articles retourne les articles publiés', async () => {
    const sortMock = vi.fn().mockResolvedValue([
      { _id: 'a1', title: 'Mon Article', published: true },
    ]);
    articleModelMock.find.mockReturnValue({ sort: sortMock });

    const response = await request(app).get('/api/articles');

    expect(articleModelMock.find).toHaveBeenCalledWith({ published: true });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("GET /api/articles/:slug retourne l'article publié", async () => {
    articleModelMock.findOne.mockResolvedValue({
      _id: 'a1',
      slug: 'mon-article',
      title: 'Mon Article',
    });

    const response = await request(app).get('/api/articles/mon-article');

    expect(articleModelMock.findOne).toHaveBeenCalledWith({
      slug: 'mon-article',
      published: true,
    });
    expect(response.status).toBe(200);
    expect(response.body._id).toBe('a1');
  });

  it('GET /api/articles/:slug retourne 404 si article absent', async () => {
    articleModelMock.findOne.mockResolvedValue(null);

    const response = await request(app).get('/api/articles/article-inexistant');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Article introuvable' });
  });

  it('POST /api/articles retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/articles')
      .send({ title: 'Nouvel Article', slug: 'nouvel-article', content: 'Contenu' });

    expect(response.status).toBe(401);
  });

  it('POST /api/articles crée un article si admin', async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'admin' });
    articleModelMock.create.mockResolvedValue({
      _id: 'a2',
      title: 'Nouvel Article',
      slug: 'nouvel-article',
    });

    const response = await request(app)
      .post('/api/articles')
      .set('Authorization', 'valid-admin-token')
      .send({ title: 'Nouvel Article', slug: 'nouvel-article', content: 'Contenu' });

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('a2');
  });

  it("DELETE /api/articles/:id supprime l'article si admin", async () => {
    jwtMock.verify.mockReturnValue({ id: 'u1', role: 'admin' });
    articleModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'a1' });

    const response = await request(app)
      .delete('/api/articles/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid-admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Article supprimé' });
  });
});
