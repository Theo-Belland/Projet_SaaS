import express from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();

// Public
router.get('/', asyncWrap(getSkills));

// Admin seulement
router.post('/', authMiddleware, asyncWrap(createSkill));
router.put('/:id', authMiddleware, asyncWrap(updateSkill));
router.delete('/:id', authMiddleware, asyncWrap(deleteSkill));

export default router;
