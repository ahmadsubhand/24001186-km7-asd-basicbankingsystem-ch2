import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER, 
    pass: process.env.MAILER_PASSWORD,
  }
});

export default transporter;