import express from 'express';
import { uploadDoc, listDocs } from '../controllers/docController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.post('/upload', authenticateJWT, uploadDoc);
router.get('/', authenticateJWT, listDocs);
export default router;
