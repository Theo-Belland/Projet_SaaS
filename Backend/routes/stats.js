import express from 'express';
import { trackVisit, getStats } from '../controllers/statsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();

// Public (appelé depuis le frontend pour tracker les pages)
router.post('/visit', asyncWrap(trackVisit));

// Admin seulement
router.get('/', authMiddleware, asyncWrap(getStats));

export default router;
