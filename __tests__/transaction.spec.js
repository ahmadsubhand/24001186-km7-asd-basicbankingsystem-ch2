import { createTransaction, getAllTransactions, getTransactionById } from "../services/transaction.js";
import { PrismaClient as mockPrismaClient } from "@prisma/client";

const transactionArray = [
  { id: 1, amount: 5000, sourceAccountId: 2, destinationAccountId: 3 },
  { id: 2, amount: 5000, sourceAccountId: 2, destinationAccountId: 3 },
  { id: 3, amount: 50000, sourceAccountId: 5, destinationAccountId: 6 },
  { id: 4, amount: 50000, sourceAccountId: 1, destinationAccountId: 6 }
];

const newTransaction = {
  sourceAccountId: 1,
  destinationAccountId: 2,
  amount: 5000
}

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    bankAccount: {
      update: jest.fn(),
    },
    $transaction: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};

describe('createTransaction', () => {
  const req = { body: { ...newTransaction } };
  const errorMessage = 'Transaction failed'

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('should create a transaction between two account', async () => {
    mockPrismaClient().$transaction.mockImplementation(async (tx) => {
      return await tx({
        bankAccount: {
          update: jest.fn().mockResolvedValueOnce({ ...transactionArray[0] }),
        },
        transaction: {
          create: jest.fn().mockResolvedValueOnce(transactionArray[0])
        }
      });
    });
    await createTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transaction successfully',
      data: expect.any(Object)
    });
  });

  test('should return 500 if account not enough to send', async () => {
    mockPrismaClient().$transaction.mockImplementation(async (tx) => {
      return await tx({
        bankAccount: {
          update: jest.fn().mockResolvedValueOnce({ balance: -1 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValueOnce(transactionArray[0])
        }
      });
    });
    await createTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: "Don't have enough to send"
    });
  });

  test('should return 500 if createTransaction throws an error', async () => {
    mockPrismaClient().$transaction.mockRejectedValue(errorMessage)
    await createTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
});

describe('getAllTransactions', () => {
  const req = {};
  const errorMessage = 'Database connection error';

  beforeEach(() => {
    mockPrismaClient().transaction.findMany.mockResolvedValue(transactionArray)
  })

  test('should get all transactions', async () => {
    await getAllTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "All transactions retrieved successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getAllTransactions throws an error', async () => {
    mockPrismaClient().transaction.findMany.mockRejectedValue(errorMessage)
    await getAllTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to retrieved all transactions',
      error: errorMessage
    });
  });
})

describe('getTransactionById', () => {
  const req = { params: { transaction: 2 } };
  const errorMessage = 'Failed to retrieved transaction';

  beforeEach(() => {
    mockPrismaClient().transaction.findUnique.mockResolvedValue({ ...transactionArray[2] })
  })

  test('should get account by id', async () => {
    await getTransactionById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Transaction retrieved successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getTransactionById throws an error', async () => {
    mockPrismaClient().transaction.findUnique.mockRejectedValue(errorMessage);
    await getTransactionById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})