import { createAccount, deposit, getAccountById, getAllAccounts, withdraw } from "../services/account.js";
import { PrismaClient as mockPrismaClient } from "@prisma/client";

const accountArray = [
  { id: 1, bankName: 'BRI', bankAccountNumber: '5644386582', balance: 500000, userId: 1 },
  { id: 2, bankName: 'BNI', bankAccountNumber: '7864539765', balance: 490000, userId: 2 },
  { id: 3, bankName: 'BCA', bankAccountNumber: '5644386432', balance: 505000, userId: 3 },
];

const newAccount = {
  bankName: 'BRI',
  bankAccountNumber: '7634386582',
  balance: 1000000,
  userId: 4
}

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    bankAccount: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
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

describe('createAccount', () => {
  const req = { body: { ...newAccount } };
  const errorMessage = 'Database connection error';

  beforeEach(() => {
    mockPrismaClient().bankAccount.create.mockResolvedValue({ id: 5, ...newAccount })
  })

  test('should create a new bank account', async () => {
    await createAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Account created succesfully',
      data: expect.any(Object)
    });
  });

  test('should return 500 if createUser throws an error', async () => {
    mockPrismaClient().bankAccount.create.mockRejectedValue(errorMessage);
    await createAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to created account',
      error: errorMessage
    });
  });
});

describe('getAllAccounts', () => {
  const req = {};
  const errorMessage = 'Failed to retrieved all accounts';

  beforeEach(() => {
    mockPrismaClient().bankAccount.findMany.mockResolvedValue(accountArray)
  })

  test('should get all bank accounts', async () => {
    await getAllAccounts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "All accounts retrieved successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getAllAccounts throws an error', async () => {
    mockPrismaClient().bankAccount.findMany.mockRejectedValue(errorMessage);
    await getAllAccounts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})

describe('getAccountById', () => {
  const req = { params: { account: 2 } };
  const errorMessage = 'Failed to retrived account';

  beforeEach(() => {
    mockPrismaClient().bankAccount.findUnique.mockResolvedValue({ ...accountArray[2] })
  })

  test('should get account by id', async () => {
    await getAccountById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Account retrieved successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getAccountById throws an error', async () => {
    mockPrismaClient().bankAccount.findUnique.mockRejectedValue(errorMessage);
    await getAccountById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})

describe('withdraw', () => {
  const req = { params: { account: 2 }, body: { amount: 5000 } };

  beforeEach(() => {
    // mockPrismaClient().bankAccount.update.mockResolvedValue({ ...accountArray[2] })
    jest.clearAllMocks();
  })

  test('should withdraw by account id', async () => {
    // Mock Prisma $transaction and tx.bankAccount.update to simulate a successful withdrawal
    mockPrismaClient().$transaction.mockImplementation(async (tx) => {
      return tx({
        bankAccount: {
          update: jest.fn().mockResolvedValue({ ...accountArray[2] })
        }
      });
    });
    await withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Withdraw successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if account not enough to withdraw', async() => {
    const errorMessage = 'Failed to withdraw';
    mockPrismaClient().$transaction.mockImplementation(async (tx) => {
      return tx({
        bankAccount: {
          update: jest.fn().mockResolvedValue({ balance: -1 })
        }
      });
    });
    await withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: `Don't have enough to withdraw ${req.body.amount}`
    });
  })

  test('should return 500 if withdraw throws an error', async () => {
    const errorMessage = 'Failed to withdraw';
    mockPrismaClient().$transaction.mockRejectedValue(errorMessage)
    await withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})

describe('deposit', () => {
  const req = { params: { account: 2 }, body: { amount: 5000 } };

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('should deposit by account id', async () => {
    // Mock Prisma $transaction and tx.bankAccount.update to simulate a successful withdrawal
    mockPrismaClient().$transaction.mockImplementation(async (tx) => {
      return tx({
        bankAccount: {
          update: jest.fn().mockResolvedValue({ ...accountArray[2] })
        }
      });
    });
    await deposit(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Deposit successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if deposit throws an error', async () => {
    const errorMessage = 'Failed to deposit';
    mockPrismaClient().$transaction.mockRejectedValue(errorMessage)
    await deposit(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})