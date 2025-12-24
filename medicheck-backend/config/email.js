import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced email configuration with better error handling
const getEmailConfig = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,   //587 
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Check if email credentials are provided
  const hasCredentials = config.auth.user && config.auth.pass;
  
  if (!hasCredentials) {
    console.warn('⚠️ Email credentials not configured - running in simulation mode');
    return null; // Return null to indicate simulation mode
  }

  return config;
};

const emailConfig = getEmailConfig();

// Create transporter only if credentials are available
const transporter = emailConfig ? nodemailer.createTransport(emailConfig) : null;

// Verify connection only if transporter exists
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('📧 Email system running in simulation mode');
}

// Enhanced email service with simulation fallback
export const sendEmail = async (to, subject, html, text = '') => {
  // If no transporter (simulation mode), log and return success
  if (!transporter) {
    console.log(`📧 [EMAIL SIMULATION] To: ${to}`);
    console.log(`📧 [EMAIL SIMULATION] Subject: ${subject}`);
    console.log(`📧 [EMAIL SIMULATION] Content: ${text || 'HTML email content'}`);
    return { success: true, simulated: true, messageId: 'simulated-' + Date.now() };
  }

  try {
    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'Medicheck System',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER
      },
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Basic HTML to text conversion
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Fallback to simulation mode on error
    console.log(`📧 [EMAIL FALLBACK] To: ${to}`);
    console.log(`📧 [EMAIL FALLBACK] Subject: ${subject}`);
    
    return { 
      success: false, 
      error: error.message,
      simulated: true 
    };
  }
};

export default transporter;

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Email configuration
// const emailConfig = {
//   host: process.env.SMTP_HOST || 'smtp.gmail.com',
//   port: process.env.SMTP_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS, // Use app password for Gmail
//   },
// };

// // Create transporter
// const transporter = nodemailer.createTransport(emailConfig);

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ Email configuration error:', error);
//   } else {
//     console.log('✅ Email server is ready to send messages');
//   }
// });

// export default transporter;
