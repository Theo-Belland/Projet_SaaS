import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { messageModelMock, nodemailerMock } = vi.hoisted(() => ({
  messageModelMock: {
    find: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  nodemailerMock: {
    sendMail: vi.fn(),
  },
}));

vi.mock('../models/Message.js', () => ({
  default: messageModelMock,
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: nodemailerMock.sendMail,
    })),
  },
}));

import app from '../app.js';

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_USER = 'smtp@test.com';
  });

  it('GET /api/contact retourne les messages triés', async () => {
    const sortMock = vi.fn().mockResolvedValue([{ _id: 'm1' }]);
    messageModelMock.find.mockReturnValue({ sort: sortMock });

    const response = await request(app).get('/api/contact');

    expect(messageModelMock.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ _id: 'm1' }]);
  });

  it('POST /api/contact crée un message et envoie un email', async () => {
    messageModelMock.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    nodemailerMock.sendMail.mockResolvedValue({ accepted: ['smtp@test.com'] });

    const response = await request(app).post('/api/contact').send({
      name: 'Theo',
      email: 'theo@test.com',
      subject: 'Demande de devis',
      message: 'Bonjour',
    });

    expect(response.status).toBe(200);
    expect(messageModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Theo',
        email: 'theo@test.com',
        subject: 'Demande de devis',
        normalizedSubject: 'demande de devis',
        message: 'Bonjour',
      })
    );
    expect(nodemailerMock.sendMail).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({ success: true, message: 'Message envoyé' });
  });

  it('DELETE /api/contact/:id retourne 404 si message introuvable', async () => {
    messageModelMock.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app).delete('/api/contact/507f1f77bcf86cd799439011');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Message introuvable' });
  });

  it('PATCH /api/contact/:id/read marque le message comme lu', async () => {
    messageModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'm2' });

    const response = await request(app).patch('/api/contact/507f1f77bcf86cd799439011/read');

    expect(messageModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      { read: true }
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Message marqué comme lu' });
  });

  it('POST /api/contact/:id/reply retourne 404 si message absent', async () => {
    messageModelMock.findById.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/contact/507f1f77bcf86cd799439011/reply')
      .send({ reply: 'Merci pour votre message' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Message non trouvé' });
  });

  it('POST /api/contact/:id/reply envoie une réponse et sauvegarde en base', async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    const messageDoc = {
      _id: '507f1f77bcf86cd799439011',
      email: 'client@test.com',
      subject: 'Sujet',
      replies: [],
      save: saveMock,
    };

    messageModelMock.findById.mockResolvedValue(messageDoc);
    nodemailerMock.sendMail.mockResolvedValue({ accepted: ['client@test.com'] });

    const response = await request(app)
      .post('/api/contact/507f1f77bcf86cd799439011/reply')
      .send({ reply: 'Voici une reponse' });

    expect(nodemailerMock.sendMail).toHaveBeenCalledTimes(1);
    expect(messageDoc.replies).toHaveLength(1);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Réponse envoyée' });
  });
});
