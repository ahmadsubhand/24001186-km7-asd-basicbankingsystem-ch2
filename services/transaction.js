import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function transfer(from, to, amount) {
  return prisma.$transaction(async (tx) => {
    const sender = await tx.bankAccount.update({
      where: {
        id: from,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    })

    if (sender.balance < 0) {
      throw new Error(`Don't have enough to send`)
    }

    const recipient = await tx.bankAccount.update({
      where: {
        id: to,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    })

    const transaction = await tx.transaction.create({
      data: {
        sourceAccountId: from,
        destinationAccountId: to,
        amount: amount
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      }
    })

    return transaction
  })
}

const createTransaction = async (req, res) => {
  try {
    let transaction = await transfer(req.body.sourceAccountId, req.body.destinationAccountId, req.body.amount)
    res.status(201).json({
      message: 'Transaction successfully',
      data: transaction
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Transaction failed',
      error: err.message || err
    })
  }
}

const getAllTransactions = async (req, res) => {
  try {
    let transactions = await prisma.transaction.findMany()
    res.status(200).json({
      message: 'All transactions retrieved successfully',
      data: transactions
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrieved all transactions',
      error: err
    })
  }
}

const getTransactionById = async (req, res) => {
  try {
    let transaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(req.params.transaction)
      },
      include: {
        sourceAccount: true,
        destinationAccount: true
      }
    })
    res.status(200).json({
      message: 'Transaction retrieved successfully',
      data: transaction
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrieved transaction',
      error: err
    })
  }
}

export { createTransaction, getAllTransactions, getTransactionById }