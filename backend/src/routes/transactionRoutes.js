import express from 'express';
import { listTransactions, createTransaction } from '../controllers/transactionController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, listTransactions);
router.post('/', authenticateJWT, createTransaction); 

export default router;
