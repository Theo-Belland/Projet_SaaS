import express from 'express';
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/admin.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();

// Public
router.get('/', asyncWrap(getArticles));
router.get('/:slug', asyncWrap(getArticleBySlug));

// Admin seulement (utilise :id pour les mutations)
router.post('/', authMiddleware, adminOnly, asyncWrap(createArticle));
router.put('/:id', authMiddleware, adminOnly, asyncWrap(updateArticle));
router.delete('/:id', authMiddleware, adminOnly, asyncWrap(deleteArticle));

export default router;
