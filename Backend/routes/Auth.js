import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { asyncWrap } from '../utils/asyncWrap.js';

const router = express.Router();

router.post('/register', asyncWrap(register));
router.post('/login', asyncWrap(login));
router.post('/logout', logout);

export default router;