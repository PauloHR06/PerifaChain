import express from 'express';
import { listRevenueSources, createRevenueSource} from '../controllers/revenueController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.get('/', authenticateJWT, listRevenueSources);
router.post('/', authenticateJWT, createRevenueSource);
export default router;
