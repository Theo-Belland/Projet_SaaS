import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { userModelMock, bcryptMock, jwtMock } = vi.hoisted(() => ({
  userModelMock: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  jwtMock: {
    sign: vi.fn(),
  },
}));

vi.mock('../models/User.js', () => ({
  default: userModelMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

import app from '../app.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('POST /api/auth/register retourne 400 si utilisateur existe', async () => {
    userModelMock.findOne.mockResolvedValue({ _id: 'u1' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'john@doe.com', password: 'Password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'User already exists' });
  });

  it('POST /api/auth/register crée un user si email libre', async () => {
    userModelMock.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    userModelMock.create.mockResolvedValue({ _id: 'u2' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@user.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(userModelMock.create).toHaveBeenCalledWith({
      email: 'new@user.com',
      password: 'hashed-password',
      role: 'user',
    });
    expect(response.body).toEqual({ message: 'User created', userId: 'u2' });
  });

  it('POST /api/auth/login retourne 404 si user absent', async () => {
    userModelMock.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@user.com', password: 'Password123' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('POST /api/auth/login retourne 400 si mot de passe invalide', async () => {
    userModelMock.findOne.mockResolvedValue({ _id: 'u3', password: 'hash', role: 'user' });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@doe.com', password: 'bad-pass' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid password' });
  });

  it('POST /api/auth/login retourne un token si credentials valides', async () => {
    userModelMock.findOne.mockResolvedValue({ _id: 'u4', password: 'hash', role: 'admin' });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@site.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'u4', role: 'admin' },
      'test-secret',
      { expiresIn: '1d' }
    );
    expect(response.body).toEqual({ token: 'mock-jwt-token' });
  });
});
