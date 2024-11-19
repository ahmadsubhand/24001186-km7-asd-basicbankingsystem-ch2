import { Router } from "express";
import { createTransaction, getAllTransactions, getTransactionById } from "../services/transaction.js";

const router = Router();

router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/:transaction', getTransactionById);

export default router