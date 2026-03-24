import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const getEmailConfig = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  };

  const hasCredentials = config.auth.user && config.auth.pass;

  if (!hasCredentials) {
    console.warn('Email credentials not configured - running in simulation mode');
    return null;
  }

  return config;
};

const emailConfig = getEmailConfig();
const transporter = emailConfig ? nodemailer.createTransport(emailConfig) : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.log('Email system running in simulation mode');
}

export const sendEmail = async (to, subject, html, text = '') => {
  if (!transporter) {
    console.log(`[EMAIL SIMULATION] To: ${to}`);
    console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
    return { success: true, simulated: true, messageId: 'simulated-' + Date.now() };
  }

  try {
    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'Medicheck System',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER,
      },
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message, simulated: true };
  }
};

export default transporter;