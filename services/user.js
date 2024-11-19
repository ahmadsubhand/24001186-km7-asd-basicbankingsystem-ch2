import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import transporter from "../libs/nodemailer.js";
import path from "path";
import fs from 'fs';

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

    res.locals.io.emit('chat', { message: 'User registered successfully!' });
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

const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user.id, email: user.email }, 'secret');
    const resetLink = `${process.env.URL_HOST || 'http://localhost:3000'}/public/reset-password?token=${resetToken}`;
    const htmlTemplatePath = path.join(__dirname, '../../../../../public/forgot-password.html');
    let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
    htmlContent = htmlContent.replace('javascript:void(0);', resetLink);
    
    await transporter.sendMail({
      from: process.env.MAILER_USER,
      to: email,
      subject: 'Reset Password Request',
      // text: `Click here to reset your password: ${resetLink}`,
      html: htmlContent
    });

    res.status(200).json({ message: 'Reset password link sent to your email' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      message: 'Failed to send reset link', error: err.message
    });
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
    const { newPassword } = req.body;

    // Verifikasi token
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        throw new notAuthorized("You're not authorized!");
      }
      req.user = decoded;
    });

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updatedUser = await prisma.user.update({
      where: { 
        id: req.user.id 
      },
      data: { 
        password: hashedPassword 
      },
      include: { 
        profile: true 
      }
    });
    delete updatedUser.password;

    res.status(200).json({ 
      message: 'Password updated successfully', 
      data: { ...updatedUser, token }
    });

    const socket = res.locals.socket[updatedUser.id]
    if (socket) {
      socket.emit('notification', { message: `Your password has been successfully updated!`, userId: updatedUser.id });
    }
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to reset password', 
      error: err.message 
    });
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

export { createUser, loginUser, getAllUsers, getUserById, authenticateUser, forgotPassword, resetPassword }