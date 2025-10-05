import express from 'express';
import { listLoans, createLoan } from '../controllers/loanController.js';
import { authenticateJWT } from '../middlewares/auth.js';
const router = express.Router();
router.get('/', authenticateJWT, listLoans);
router.post('/', authenticateJWT, createLoan);
export default router;
