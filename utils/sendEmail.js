const nodemailer = require('nodemailer');

module.exports = async (senderOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'adeyemodanny013@gmail.com',
    to: senderOptions.email,
    subject: senderOptions.subject,
    text: senderOptions.message,
  };

  await transporter.sendMail(mailOptions);
};
