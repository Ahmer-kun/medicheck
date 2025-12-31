// ELASTIC

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Elastic Email SMTP configuration
// const getEmailConfig = () => {
//   const config = {
//     host: 'smtp.elasticemail.com',
//     port: 2525, // Elastic Email port (also supports 587)
//     secure: false, // false for 2525, true for 465
//     auth: {
//       user: process.env.ELASTIC_EMAIL_USER, // Your Elastic Email username/email
//       pass: process.env.ELASTIC_EMAIL_API_KEY // Your Elastic Email API key
//     },
//     tls: {
//       rejectUnauthorized: false // May help with Railway connections
//     }
//   };

//   // Check if credentials are provided
//   const hasCredentials = config.auth.user && config.auth.pass;
  
//   if (!hasCredentials) {
//     console.warn('⚠️ Elastic Email credentials not configured - running in simulation mode');
//     return null;
//   }

//   return config;
// };

// const emailConfig = getEmailConfig();
// const transporter = emailConfig ? nodemailer.createTransport(emailConfig) : null;

// // Verify connection
// if (transporter) {
//   transporter.verify((error) => {
//     if (error) {
//       console.error('❌ Elastic Email connection error:', error.message);
//     } else {
//       console.log('✅ Elastic Email server is ready');
//     }
//   });
// } else {
//   console.log('📧 Email system running in simulation mode');
// }

// // Enhanced email service with simulation fallback
// export const sendEmail = async (to, subject, html, text = '') => {
//   // Simulation mode
//   if (!transporter) {
//     console.log(`📧 [EMAIL SIMULATION] To: ${to}`);
//     console.log(`📧 [EMAIL SIMULATION] Subject: ${subject}`);
//     return { success: true, simulated: true, messageId: 'simulated-' + Date.now() };
//   }

//   try {
//     const mailOptions = {
//       from: {
//         name: process.env.FROM_NAME || 'Medicheck System',
//         address: process.env.FROM_EMAIL || process.env.ELASTIC_EMAIL_USER
//       },
//       to,
//       subject,
//       html,
//       text: text || html.replace(/<[^>]*>/g, '')
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent successfully via Elastic Email:', result.messageId);
//     return { success: true, messageId: result.messageId };
    
//   } catch (error) {
//     console.error('❌ Elastic Email sending error:', error.message);
    
//     // Fallback to simulation
//     console.log(`📧 [EMAIL FALLBACK] To: ${to}`);
//     console.log(`📧 [EMAIL FALLBACK] Subject: ${subject}`);
    
//     return { 
//       success: false, 
//       error: error.message,
//       simulated: true 
//     };
//   }
// };

// export default transporter;

//   RESEND
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Verify setup
if (resend) {
  console.log('✅ Resend email service initialized');
} else {
  console.warn('⚠️ RESEND_API_KEY not configured - running in simulation mode');
}

// Enhanced email service with simulation fallback
export const sendEmail = async (to, subject, html, text = '') => {
  // Simulation mode if no Resend client
  if (!resend) {
    console.log(`📧 [EMAIL SIMULATION] To: ${to}`);
    console.log(`📧 [EMAIL SIMULATION] Subject: ${subject}`);
    console.log(`📧 [EMAIL SIMULATION] Content: ${text || 'HTML email content'}`);
    return { success: true, simulated: true, messageId: 'simulated-' + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL 
        ? `Medicheck <${process.env.FROM_EMAIL}>`
        : 'Medicheck <onboarding@resend.dev>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Basic HTML to text
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email sent successfully via Resend:', data?.id);
    return { 
      success: true, 
      messageId: data?.id,
      provider: 'resend'
    };
    
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error.message);
    
    // Fallback to simulation
    console.log(`📧 [EMAIL FALLBACK] To: ${to}`);
    console.log(`📧 [EMAIL FALLBACK] Subject: ${subject}`);
    
    return { 
      success: false, 
      error: error.message,
      simulated: true 
    };
  }
};

// For compatibility with existing imports
export default { sendEmail };



// GMAIL
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Enhanced email configuration with better error handling
// const getEmailConfig = () => {
//   const config = {
//     host: process.env.SMTP_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.SMTP_PORT) || 465,   //587 
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   };

//   // Check if email credentials are provided
//   const hasCredentials = config.auth.user && config.auth.pass;
  
//   if (!hasCredentials) {
//     console.warn('⚠️ Email credentials not configured - running in simulation mode');
//     return null; // Return null to indicate simulation mode
//   }

//   return config;
// };

// const emailConfig = getEmailConfig();

// // Create transporter only if credentials are available
// const transporter = emailConfig ? nodemailer.createTransport(emailConfig) : null;

// // Verify connection only if transporter exists
// if (transporter) {
//   transporter.verify((error, success) => {
//     if (error) {
//       console.error('❌ Email configuration error:', error);
//     } else {
//       console.log('✅ Email server is ready to send messages');
//     }
//   });
// } else {
//   console.log('📧 Email system running in simulation mode');
// }

// // Enhanced email service with simulation fallback
// export const sendEmail = async (to, subject, html, text = '') => {
//   // If no transporter (simulation mode), log and return success
//   if (!transporter) {
//     console.log(`📧 [EMAIL SIMULATION] To: ${to}`);
//     console.log(`📧 [EMAIL SIMULATION] Subject: ${subject}`);
//     console.log(`📧 [EMAIL SIMULATION] Content: ${text || 'HTML email content'}`);
//     return { success: true, simulated: true, messageId: 'simulated-' + Date.now() };
//   }

//   try {
//     const mailOptions = {
//       from: {
//         name: process.env.FROM_NAME || 'Medicheck System',
//         address: process.env.FROM_EMAIL || process.env.SMTP_USER
//       },
//       to,
//       subject,
//       html,
//       text: text || html.replace(/<[^>]*>/g, '') // Basic HTML to text conversion
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent successfully:', result.messageId);
//     return { success: true, messageId: result.messageId };
//   } catch (error) {
//     console.error('❌ Error sending email:', error);
    
//     // Fallback to simulation mode on error
//     console.log(`📧 [EMAIL FALLBACK] To: ${to}`);
//     console.log(`📧 [EMAIL FALLBACK] Subject: ${subject}`);
    
//     return { 
//       success: false, 
//       error: error.message,
//       simulated: true 
//     };
//   }
// };

// export default transporter;
