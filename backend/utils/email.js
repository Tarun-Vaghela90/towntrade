const nodemailer = require("nodemailer");


console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  secure: false, // Use SSL
  port: 2525,    // Secure port for SMTP
  auth: {
    user: process.env.EMAIL_USER,   // Email address from the .env file
    pass: process.env.EMAIL_PASS,   // App password or email password from the .env file
  },
  logger: true,  // Optional: Enables debug logging (set to true for more detailed logs)
  debug: true,   // Optional: Enable SMTP debugging
});


function getEmailTemplate(type, data) {
  if (type === "create") {
    return {
      subject: "Your Account Credentials",
      html: `
        <h2>Welcome, ${data.name}</h2>
        <p>Your account has been created.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p>Use this to login to your account.</p>
      `,
    };
  }

  if (type === "email_verfiy") {
    return {
      subject: " Account Email Verification",
      html: `
      
      <p>This will expire in 15 minutes.</p>
      <h2>Hello,${data.name}</h2>
<p>Email Verification</p>
<p>Click the button below to verify your Email:</p>
<a href="http://localhost:5000/api/auth/verify-email/${data.token}" 
   style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
  Verify Email
</a>
<p>This link will expire in 15 minutes.</p>

    `
    };
  }

  if (type === "confirm_email_verify") {
    return {
      subject: "Email Confirmation",
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Verified</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-top: 50px; padding: 30px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h2 style="color: #333333; font-size: 28px; margin: 0;">Hello, ${data.name} 👋</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <p style="font-size: 16px; color: #555555; margin: 0;">Your email has been <strong style="color: #4CAF50;">verified successfully</strong>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px;">
              <p style="font-size: 14px; color: #888888; margin: 0;">Thank you for confirming your email. You can now access all features of your account.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 30px;">
              <a href="http://localhost:3000/" 
                 style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px;">
                Go to Login
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-size: 12px; color: #aaaaaa; margin: 0;">If you did not perform this action, please ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

    `
    };
  }

  if (type === "forgot-password") {
    return {
      subject: "Request For Password Reset",
      html: `
      <h2>Hello, ${data.name}</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="http://localhost:5173/reset-password/${data.token}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `
    };
  }

  return {
    subject: "Notification",
    html: "<p>This is a default message.</p>",
  };
}

/**
 * Send email function
 */
const sendEmail = async (to, type, data) => {
  const { subject, html } = getEmailTemplate(type, data);

  await transporter.sendMail({
    from: '"TownTrade" <your-email@gmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
