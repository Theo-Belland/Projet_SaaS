import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/Auth.js';
import adminRoutes from './routes/Admin.js';
import contactRoutes from './routes/Contact.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import articleRoutes from './routes/articles.js';
import statsRoutes from './routes/stats.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

export default app;
