import express from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  replyToMessage,
} from '../controllers/contactController.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();

router.get('/', asyncWrap(getMessages));
router.post('/', asyncWrap(sendMessage));
router.delete('/:id', asyncWrap(deleteMessage));
router.patch('/:id/read', asyncWrap(markAsRead));
router.post('/:id/reply', asyncWrap(replyToMessage));

export default router;