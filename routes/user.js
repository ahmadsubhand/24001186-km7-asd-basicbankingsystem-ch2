import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createUser, loginUser, getAllUsers, getUserById, authenticateUser, forgotPassword, resetPassword } from '../services/user.js'

const prisma = new PrismaClient();
const router = Router();

router.post('/', createUser);
router.post('/login', loginUser);
router.get('/auth', authenticateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/', getAllUsers);
router.get('/:userId', getUserById);

router.delete('/:userId/reset', async (req, res) => {
  try {
    await prisma.profile.delete({
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to reset user profile',
      error: err
    })
  }
})

export default router;