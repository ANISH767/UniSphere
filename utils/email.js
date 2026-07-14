const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || 'dummy_user',
        pass: process.env.EMAIL_PASS || 'dummy_password'
      }
    });

    // Define the email options
    const mailOptions = {
      from: 'Unisphere Events <noreply@unisphere.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
