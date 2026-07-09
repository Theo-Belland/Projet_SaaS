import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getProjects,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'projects');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

const imageFileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(new Error('Seules les images sont autorisées'));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
});

// Public
router.get('/', asyncWrap(getProjects));
router.get('/admin/all', authMiddleware, asyncWrap(getAllProjects));
router.get('/:id', asyncWrap(getProjectById));

// Admin seulement
router.post('/', authMiddleware, upload.array('images', 10), asyncWrap(createProject));
router.put('/:id', authMiddleware, upload.array('images', 10), asyncWrap(updateProject));
router.delete('/:id', authMiddleware, asyncWrap(deleteProject));

export default router;
