import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

const createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        profile: {
          create: {
            identifyTypes: req.body.identifyTypes,
            identifyNumber: req.body.identifyNumber,
            address: req.body.address
          }
        }
      }
    })
    res.status(201).json({
      message: 'User registered successfully',
      data: user
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to registered user',
      error: err
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique(
      { 
        where: { 
          email: req.body.email,
        }, 
        include: {
          profile: true
        }
      }
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'secret');
    const userWithoutPass = user;
    delete userWithoutPass.password;  
    res.status(200).json({
      message: 'User success to login',
      data: {
        ...userWithoutPass, token
      }
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'User failed to login',
      error: err.message
    })
  }
}

class notAuthorized extends Error {
  constructor(message) {
    super(message);
    this.name = "notAuthorized";
  }
}

const authenticateUser = async (req, res) => {
  try {
    const authorization = req.headers.authorization;
  
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new notAuthorized("You're not authorized!");
    }

    const token = authorization.split(" ")[1];
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        throw new notAuthorized("You're not authorized!");
      }
      req.user = decoded;
    });

    res.status(200).json({
      message: 'Authenticate user successfully',
      data: req.user
    });
  } catch(err) {
    console.log(err);
    if (err instanceof notAuthorized) {
      res.status(401).json({
        message: 'Failed to authenticate user',
        error: err.message
      });
    } else {
      res.status(500).json({
        message: 'Failed to authenticate user',
        error: err.message || err
      });
    }
  }
}

const getAllUsers = async(req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      message: 'All users retrieved successfully',
      data: users
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrieved all users',
      error: err
    })
  }
}

const getUserById = async(req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.userId)
      },
      include: {
        profile: true
      }
    })
    res.status(200).json({
      message: 'User retrived successfully',
      data: user
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to retrived user',
      error: err
    })
  }
}

export { createUser, loginUser, getAllUsers, getUserById, authenticateUser }