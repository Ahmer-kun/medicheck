import { sendEmail } from '../config/email.js';
import { emailTemplates } from '../utils/emailTemplates.js';

class EmailService {
  async sendEmail(to, subject, html, text = '') {
    return await sendEmail(to, subject, html, text);
  }

  async sendUserRegistrationEmail(user, temporaryPassword = null) {
    const template = emailTemplates.userRegistration(user, temporaryPassword);
    
    // Use user's email or fallback to username-based email
    const toEmail = user.email || `${user.username}@medicheck.com`;
    
    console.log(`📧 Preparing registration email for: ${toEmail}`);
    
    const result = await this.sendEmail(
      toEmail,
      template.subject,
      template.html,
      template.text
    );

    if (result.simulated) {
      console.log('📧 Email sent in simulation mode');
    } else if (result.success) {
      console.log(`✅ Welcome email sent to: ${toEmail}`);
    } else {
      console.error(`❌ Failed to send email to: ${toEmail}`, result.error);
    }

    return result;
  }

  async sendPasswordResetEmail(user, newPassword) {
    const template = emailTemplates.passwordReset(user, newPassword);
    const toEmail = user.email || `${user.username}@medicheck.com`;
    
    console.log(`📧 Preparing password reset email for: ${toEmail}`);
    
    const result = await this.sendEmail(
      toEmail,
      template.subject,
      template.html
    );

    if (result.simulated) {
      console.log('📧 Password reset email sent in simulation mode');
    }

    return result;
  }
}

export default new EmailService();

// second log use if fail