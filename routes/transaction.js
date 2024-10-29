import { Router } from "express";
import { createTransaction, getAllTransactions, getTransactionById } from "../services/transaction.js";

const router = Router();

router.use((req, res, next) => {
  console.log(`Time: ${Date.now()} ${req.method} ${req.url}`);
  next();
})

router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/:transaction', getTransactionById);

export default router