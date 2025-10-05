import express from 'express';
import { listProjects, createProject, getProject } from '../controllers/projectController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.get('/', authenticateJWT, listProjects);
router.get('/:id', authenticateJWT, getProject);
router.post('/', authenticateJWT, createProject);
export default router;
