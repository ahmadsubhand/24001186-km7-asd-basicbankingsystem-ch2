import { Router } from "express";
import { createAccount, deposit, getAccountById, getAllAccounts, withdraw } from "../services/account.js";

const router = Router();

router.post('/', createAccount);
router.get('/', getAllAccounts);
router.get('/:account', getAccountById);
router.put('/:account/withdraw', withdraw);
router.put('/:account/deposit', deposit);

export default router