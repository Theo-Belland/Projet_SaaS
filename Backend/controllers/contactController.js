import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import { AppError } from '../utils/AppError.js';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

const normalizeSubject = (value = '') =>
  value
    .replace(/\[PM-ID:[0-9a-fA-F]{24}\]/gi, '')
    .replace(/^(Re:\s*)+/i, '')
    .trim()
    .toLowerCase();

export const getMessages = async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  const newMessage = await Message.create({
    name,
    email,
    subject,
    normalizedSubject: normalizeSubject(subject),
    message,
  });

  const transporter = createTransporter();
  const subjectTag = `[PM-ID:${newMessage._id}]`;

  await transporter.sendMail({
    from: email,
    to: process.env.MAIL_PRO || process.env.SMTP_USER,
    subject: `${subjectTag} ${subject} - Nouveau message de ${name}`,
    text: `${message}\n\nMessage ID: ${newMessage._id}`,
    messageId: `<PM-ID:${newMessage._id}@pm.local>`,
  });

  res.json({ success: true, message: 'Message envoyé' });
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const deleted = await Message.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Message introuvable', 404);
  res.json({ success: true, message: 'Message supprimé' });
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  await Message.findByIdAndUpdate(id, { read: true });
  res.json({ success: true, message: 'Message marqué comme lu' });
};

export const replyToMessage = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  const message = await Message.findById(id);
  if (!message) throw new AppError('Message non trouvé', 404);

  const transporter = createTransporter();
  const subjectTag = `[PM-ID:${message._id}]`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: message.email,
    subject: `${subjectTag} Réponse à : ${message.subject}`,
    text: reply,
    inReplyTo: `<PM-ID:${message._id}@pm.local>`,
    messageId: `<PM-REPLY:${message._id}-${Date.now()}@pm.local>`,
  });

  message.replies.push({ text: reply, sentAt: new Date() });
  await message.save();

  res.json({ success: true, message: 'Réponse envoyée' });
};
