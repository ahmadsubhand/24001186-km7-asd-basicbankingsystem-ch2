import { Router } from "express";
// import { User } from "../services/user.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.use((req, res, next) => {
  console.log(`Time: ${Date.now()} ${req.method} ${req.url}`);
  next();
})

router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
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
      message: 'User registered succesfully',
      data: user
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to registered user',
      error: err
    })
  }
})

router.get('/', async(req, res) => {
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
})

router.get('/:userId', async(req, res) => {
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
})

router.delete('/:userId/reset', async (req, res) => {
  try {
    const deletedUser = await prisma.profile.delete({
      where: {
        userId: parseInt(req.params.userId)
      }
    })
    const profile = await prisma.profile.create({
      data: {
        identifyTypes: req.body.identifyTypes,
        identifyNumber: req.body.identifyNumber,
        address: req.body.address,
        userId: parseInt(req.params.userId)
      }
    })
    res.status(201).json({
      message: 'Reset user profile successfully',
      data: profile
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to reset user profile',
      data: user
    })
  }
})

export default router;