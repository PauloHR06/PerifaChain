import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
export default router;
