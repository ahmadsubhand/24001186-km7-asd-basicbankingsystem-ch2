import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.use((req, res, next) => {
  console.log(`Time: ${Date.now()} ${req.method} ${req.url}`);
  next();
})

router.post('/', async (req, res) => {
  try {
    const account = await prisma.bankAccount.create({
      data: {
        bankName: req.body.bankName,
        bankAccountNumber: req.body.bankAccountNumber,
        balance: req.body.balance,
        userId: req.body.userId
      }
    })
    res.status(201).json({
      message: 'Account created succesfully',
      data: account
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to created account',
      error: err
    })
  }
})

router.get('/', async(req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany();
    res.status(200).json({
      message: 'All accounts retrieved successfully',
      data: accounts
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrieved all accounts',
      error: err
    })
  }
})

router.get('/:account', async (req, res) => {
  try {
    const account = await prisma.bankAccount.findUnique({
      where: {
        id: parseInt(req.params.account)
      },
      include: {
        user: true
      }
    })
    res.status(200).json({
      message: 'Account retrieved successfully',
      data: account
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrived account',
      error: err
    })
  }
})

router.put('/:account/withdraw', async (req, res) => {
  try {
    const withdraw = await prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.update({
        where: {
          id: parseInt(req.params.account)
        },
        data: {
          balance: {
            decrement: req.body.amount,
          },
        },
      })
      
      if (account.balance < 0) {
        throw new Error(`Don't have enough to withdraw ${amount}`)
      }

      return account
    })
    res.status(200).json({
      message: 'Withdraw successfully',
      data: withdraw
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to withdraw',
      error: err
    })
  }
})

router.put('/:account/deposit', async (req, res) => {
  try {
    const deposit = await prisma.$transaction(async (tx) => {
      return await tx.bankAccount.update({
        where: {
          id: parseInt(req.params.account)
        },
        data: {
          balance: {
            increment: req.body.amount,
          },
        },
      })
    })
    res.status(200).json({
      message: 'Deposit successfully',
      data: deposit
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to deposit',
      error: err
    })
  }
})

export default router