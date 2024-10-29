import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createAccount = async (req, res) => {
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
}

const getAllAccounts = async(req, res) => {
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
}

const getAccountById = async (req, res) => {
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
}

const withdraw = async (req, res) => {
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
        throw new Error(`Don't have enough to withdraw ${req.body.amount}`)
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
      error: err.message || err
    })
  }
}

const deposit = async (req, res) => {
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
}

export { createAccount, getAllAccounts, getAccountById, withdraw, deposit };