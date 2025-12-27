import nodemailer from "nodemailer";

console.log("DEBUG MAILER HOST:", process.env.EMAIL_HOST);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<h3>Welcome to Trello Clone!</h3>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link expires in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: `<h3>Password Reset Request</h3>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}