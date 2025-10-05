import express from 'express';
import { listArtists, createArtist } from '../controllers/artistController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.get('/', authenticateJWT, listArtists);
router.post('/', authenticateJWT, createArtist);
export default router;
