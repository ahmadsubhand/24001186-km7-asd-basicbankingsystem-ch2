import { createUser, loginUser, getAllUsers, getUserById, authenticateUser } from "../services/user.js"
import { PrismaClient as mockPrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

const userArray = [
  { id: 1, name: "Ahmad", email: "ahmad@code.com", password: "5757" },
  { id: 2, name: "Lumine", email: "lumine@code.com", password: "7575" },
  { id: 3, name: "Aether", email: "aether@code.com", password: "7575" },
  { id: 4, name: "Jangkrik", email: "jajfk@email.com", password: "12345" }
];

const newUser = { 
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  identifyTypes: "ID",
  identifyNumber: "123456789",
  address: "Test Address" 
}

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fakeToken'),
  verify: jest.fn()
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};

describe('createUser', () => {
  const req = { body: { ...newUser } };
  const errorMessage = 'Database connection error';

  beforeEach(() => {
    mockPrismaClient().user.create.mockResolvedValue({ id: 5, ...newUser })
  })

  test('should hash the password and register the user', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    await createUser(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, saltRounds);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      data: expect.any(Object)
    });
  });

  test('should return 500 if createUser throws an error', async () => {  
    mockPrismaClient().user.create.mockRejectedValue(errorMessage);
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to registered user',
      error: errorMessage
    });
  });
});

describe('loginUser', () => {
  const req = { body: { email: "ahmad@code.com", password: "5757" } };

  beforeEach(() => {
    mockPrismaClient().user.findUnique.mockResolvedValue({...userArray[0]})
  })

  test('should validate password and login user', async () => {
    bcrypt.compare.mockResolvedValue(true);
    await loginUser(req, res);
    const { password, ...userWithoutPass } = userArray[0];
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, req.body.password);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User success to login',
      data: {
        ...userWithoutPass,
        token: 'fakeToken'
      }
    });
  });

  test('should return 500 if password invalid', async () => {
    const errorMessage = 'Invalid email or password';
    bcrypt.compare.mockResolvedValue(false);
    await loginUser(req, res);
    const { password, ...userWithoutPass } = userArray[0];
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, req.body.password);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User failed to login',
      error: errorMessage
    });
  })

  test('should return 500 if user not found', async () => {
    const errorMessage = 'Invalid email or password';
    mockPrismaClient().user.findUnique.mockResolvedValue(null);
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User failed to login',
      error: errorMessage
    });
  });

  test('should return 500 if loginUser throws an error', async () => {
    const errorMessage = 'Database connection error';
    mockPrismaClient().user.findUnique.mockRejectedValue({ message: errorMessage });
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User failed to login',
      error: errorMessage
    });
  });
})

describe("authenticateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should authenticate user successfully with a valid token", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken"
      }
    };

    // Mock JWT verify to return a decoded token when valid
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 1, name: "Test User" });
    });

    await authenticateUser(req, res);

    expect(jwt.verify).toHaveBeenCalledWith("validToken", "secret", expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authenticate user successfully",
      data: { id: 1, name: "Test User" }
    });
  });

  test("should return 401 if authorization header is missing", async () => {
    const req = { headers: {} };

    await authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to authenticate user",
      error: "You're not authorized!"
    });
  });

  test("should return 401 if token is invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken"
      }
    };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    await authenticateUser(req, res);

    expect(jwt.verify).toHaveBeenCalledWith("invalidToken", "secret", expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to authenticate user",
      error: "You're not authorized!"
    });
  });

  test("should return 500 if not authorized", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken"
      }
    };

    jwt.verify.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to authenticate user",
      error: "Unexpected error"
    });
  });

  test("should return 500 if an unexpected error occurs", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken"
      }
    };

    jwt.verify.mockImplementation(() => {
      throw "Unexpected error";
    });

    await authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to authenticate user",
      error: "Unexpected error"
    });
  });
});

describe('getAllUsers', () => {
  const req = {};
  const errorMessage = 'Failed to retrieved all users';

  beforeEach(() => {
    mockPrismaClient().user.findMany.mockResolvedValue(userArray)
  })

  test('should get all users', async () => {
    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "All users retrieved successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getAllUsers throws an error', async () => {
    mockPrismaClient().user.findMany.mockRejectedValue(errorMessage);
    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})

describe('getUserById', () => {
  const req = { params: { userId: 2 }};
  const errorMessage = 'Failed to retrived user';

  beforeEach(() => {
    mockPrismaClient().user.findUnique.mockResolvedValue({...userArray[2]})
  })

  test('should get user by id', async () => {
    
    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User retrived successfully",
        data: expect.any(Object),
      })
    );
  })

  test('should return 500 if getUserById throws an error', async () => {
    mockPrismaClient().user.findUnique.mockRejectedValue(errorMessage);
    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: errorMessage,
      error: errorMessage
    });
  });
})
