import transporter from "../libs/nodemailer.js";


const sendEmail = async (req, res) => {
  transporter.sendMail(
    {
      from: process.env.MAILER_USER,
      to: req.body.destinationEmail,
      subject: req.body.subject,
      text: req.body.text
    },
    (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: 'Send email failed',
          error: err.message || err
        })
      } else {
        res.status(201).json({
          message: 'Email sent successfully',
          data: info.response
        })
      }
    }
  )
}

export default sendEmail;