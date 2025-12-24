export const emailTemplates = {
  
  /**
   * User Registration Email Template
   * Works in ALL email clients (Gmail, Outlook, Yahoo, etc.)
   */
  userRegistration: (user, temporaryPassword = null) => {
    const hasTemporaryPassword = temporaryPassword !== null;
    
    // Create mailto link with proper encoding
    const subject = encodeURIComponent(`Medicheck Support - User: ${user.username}`);
    const body = encodeURIComponent(`Hello Admin,\n\nI need assistance with:\n\nUsername: ${user.username}\nRole: ${user.role}\n\nIssue Description:\n[Please describe your issue here]\n\nThank you,\n${user.name}`);
    const mailtoLink = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
    
    return {
      subject: `Welcome to Medicheck - Your Account Has Been Created`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
                .password-alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .support-section { background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0; }
                .contact-link { 
                    display: inline-block; 
                    padding: 14px 28px; 
                    background: #2196F3; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    margin: 15px 0;
                    font-weight: bold;
                    font-size: 16px;
                    text-align: center;
                }
                .contact-link:hover { background: #1976D2; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                .btn { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; font-weight: bold; }
                .response-time { background: #fff; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #e0e0e0; }
                .step-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #4CAF50; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>🏥 Medicheck System</h1>
                    <p>Blockchain Medicine Tracker</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <h2>Welcome to Medicheck, ${user.name}!</h2>
                    <p>Your account has been successfully created in the Medicheck system.</p>
                    
                    <!-- Account Details -->
                    <div class="info-box">
                        <h3>📋 Account Details</h3>
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        <p><strong>Name:</strong> ${user.name}</p>
                        ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
                        <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>

                    <!-- Password Section -->
                    ${hasTemporaryPassword ? `
                    <div class="password-alert">
                        <h3>🔐 Your Password</h3>
                        <p><strong>Your password:</strong> <code style="background: #f8f9fa; padding: 8px 12px; border-radius: 4px; font-size: 16px; border: 1px solid #ddd;">${temporaryPassword}</code></p>
                        <p><strong style="color: #dc3545;">Important:</strong> This is your permanent password. If you forget it, you must contact the administrator.</p>
                    </div>
                    ` : `
                    <div class="info-box">
                        <h3>🔐 Password Information</h3>
                        <p>The password was set during account creation. If you need to reset it, contact the administrator.</p>
                    </div>
                    `}

                    <!-- SUPPORT SECTION - WORKING CLICKABLE LINK -->
                    <div class="support-section">
                        <h3>🛎️ Need Help? Contact Support</h3>
                        <p>If you have questions, issues, or need assistance:</p>
                        
                        <!-- BIG CLICKABLE LINK -->
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${mailtoLink}" class="contact-link">
                                📧 CLICK HERE to Contact Admin
                            </a>
                            <p style="color: #666; font-size: 14px; margin-top: 8px;">
                                This link will open your email client with a pre-filled message
                            </p>
                        </div>

                        <!-- Response Time Info -->
                        <div class="response-time">
                            <h4>⏱️ Expected Response Time:</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>Normal queries:</strong> Within 24 hours</li>
                                <li><strong>Urgent issues:</strong> Add "[URGENT]" to subject - Response within 6 hours</li>
                                <li><strong>Weekends:</strong> Response may take up to 48 hours</li>
                            </ul>
                        </div>

                        <!-- How it Works -->
                        <div class="step-box">
                            <h4>📝 How to Contact Support:</h4>
                            <ol style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>Click the blue button above</strong> - It opens your email app</li>
                                <li><strong>Your details are pre-filled</strong> - Username: ${user.username}</li>
                                <li><strong>Describe your issue</strong> - Add details in the email body</li>
                                <li><strong>Click Send</strong> - That's it!</li>
                            </ol>
                        </div>

                        <!-- Manual Option (for email clients that block links) -->
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <h4>📧 Manual Option (if link doesn't work):</h4>
                            <p><strong>To:</strong> contact.medicheck@gmail.com</p>
                            <p><strong>Subject:</strong> Medicheck Support - User: ${user.username}</p>
                            <p><strong>Include in body:</strong> Your username (${user.username}), role (${user.role}), and issue description</p>
                        </div>
                    </div>

                    <!-- Login Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="btn">
                            🚀 Access Medicheck System
                        </a>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>This is an automated message from Medicheck System.</p>
                        <p>If you didn't request this account, please contact administrator.</p>
                        <p>© ${new Date().getFullYear()} Medicheck. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
Welcome to Medicheck!

Your account has been created:
Username: ${user.username}
Role: ${user.role}
Name: ${user.name}
${user.email ? `Email: ${user.email}` : ''}

${hasTemporaryPassword ? `
YOUR PASSWORD: ${temporaryPassword}
IMPORTANT: This is your permanent password. If you forget it, contact the administrator.
` : `
Password was set during account creation.
`}

Login URL: ${process.env.APP_URL || 'http://localhost:3000'}

🛎️ SUPPORT CONTACT:
Click the link in the email to contact admin.

Or manually email:
To: contact.medicheck@gmail.com
Subject: Medicheck Support - User: ${user.username}
Body: Include your username and issue description

Response Time:
- Normal queries: Within 24 hours
- Urgent issues: Add "[URGENT]" to subject - Response within 6 hours
- Weekends: Up to 48 hours

This is an automated message.
      `.trim()
    };
  },

  /**
   * Password Reset Email Template
   */
  passwordReset: (user, newPassword) => {
    const subject = encodeURIComponent(`Medicheck Password Issue - User: ${user.username}`);
    const body = encodeURIComponent(`Hello Admin,\n\nI am having password issues:\n\nUsername: ${user.username}\n\nIssue Description:\n[Please describe your password issue]\n\nThank you,\n${user.name}`);
    const mailtoLink = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
    
    return {
      subject: `Medicheck - Password Reset`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1>🔐 Password Reset</h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${user.name},</h2>
            <p>Your password has been reset by administrator.</p>
            
            <!-- New Password -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #ffcc00;">
              <h3 style="margin-top: 0;">New Password:</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; font-size: 20px; font-weight: bold; border: 1px solid #ddd;">
                ${newPassword}
              </div>
              <p style="color: #dc3545; margin-top: 15px;">
                <strong>⚠️ Important:</strong> This is your new permanent password. If you forget it, contact the administrator.
              </p>
            </div>

            <!-- Support Section -->
            <div style="background: #e8f4fd; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>🛎️ Password Support</h3>
              
              <!-- Clickable Link -->
              <div style="text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
                <a href="${mailtoLink}" 
                   style="display: inline-block; padding: 15px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  🔓 CLICK HERE for Password Support
                </a>
                <p style="color: #666; margin-top: 10px;">Opens email with your details pre-filled</p>
              </div>

              <!-- Response Time -->
              <div style="margin: 15px 0;">
                <h4>⏱️ Password Support Response:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Password issues:</strong> Within 12 hours</li>
                  <li><strong>Locked out:</strong> Within 6 hours</li>
                  <li><strong>Weekends:</strong> Up to 48 hours</li>
                </ul>
              </div>

              <!-- Instructions -->
              <div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <h4>📝 If link doesn't work:</h4>
                <p><strong>Email:</strong> contact.medicheck@gmail.com</p>
                <p><strong>Subject:</strong> Medicheck Password Issue - User: ${user.username}</p>
                <p><strong>Body:</strong> Include your username and describe the password issue</p>
              </div>
            </div>

            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
                 style="display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🔑 Login to Medicheck
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              <p>This is an automated message from Medicheck System.</p>
              <p>© ${new Date().getFullYear()} Medicheck. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
      text: `
Password Reset - Medicheck

Hello ${user.name},

Your password has been reset by administrator.

New Password: ${newPassword}

IMPORTANT: This is your new permanent password. If you forget it, contact the administrator.

🛎️ PASSWORD SUPPORT:
Click the link in email to contact admin for password issues.

Or manually email:
To: contact.medicheck@gmail.com
Subject: Medicheck Password Issue - User: ${user.username}
Body: Include your username and describe the password issue

Response Time:
- Password issues: Within 12 hours
- Locked out: Within 6 hours
- Weekends: Up to 48 hours

Login URL: ${process.env.APP_URL || 'http://localhost:3000'}

This is an automated message.
      `.trim()
    };
  },

  /**
   * Support Contact Email Template
   */
  supportContact: (user, issueType = 'general') => {
    // Create different mailto links for different issue types
    const mailtoLinks = {
      general: `mailto:contact.medicheck@gmail.com?subject=${encodeURIComponent(`[Medicheck Support] General Query - ${user.username}`)}&body=${encodeURIComponent(`Hello Admin,\n\nUsername: ${user.username}\nRole: ${user.role}\n\nQuery:\n[Please describe your question]\n\nThank you,\n${user.name}`)}`,
      urgent: `mailto:contact.medicheck@gmail.com?subject=${encodeURIComponent(`[URGENT] Medicheck Emergency - ${user.username}`)}&body=${encodeURIComponent(`URGENT - Immediate attention needed\n\nUsername: ${user.username}\nRole: ${user.role}\n\nEmergency Description:\n[Describe the emergency]\n\nThank you,\n${user.name}`)}`,
      bug: `mailto:contact.medicheck@gmail.com?subject=${encodeURIComponent(`[BUG] Medicheck Bug Report - ${user.username}`)}&body=${encodeURIComponent(`Bug Report\n\nUsername: ${user.username}\nRole: ${user.role}\n\nBug Description:\n[Describe the bug]\n\nSteps to Reproduce:\n1.\n2.\n3.\n\nExpected Result:\n[What should happen]\n\nActual Result:\n[What actually happens]\n\nThank you,\n${user.name}`)}`,
      feature: `mailto:contact.medicheck@gmail.com?subject=${encodeURIComponent(`[FEATURE] Medicheck Feature Request - ${user.username}`)}&body=${encodeURIComponent(`Feature Request\n\nUsername: ${user.username}\nRole: ${user.role}\n\nFeature Request:\n[Describe the feature]\n\nWhy needed:\n[Explain why this feature is needed]\n\nThank you,\n${user.name}`)}`
    };

    const selectedLink = mailtoLinks[issueType] || mailtoLinks.general;
    
    return {
      subject: `Medicheck Support Contact Information`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); color: white; padding: 30px; text-align: center;">
            <h1>🛎️ Medicheck Support</h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${user.name},</h2>
            <p>Here is your support contact information for Medicheck.</p>

            <!-- Main Contact Button -->
            <div style="text-align: center; margin: 30px 0; padding: 25px; background: white; border-radius: 10px; border: 3px solid #2196F3; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">Quick Contact Admin</h3>
              
              <a href="${selectedLink}" 
                 style="display: inline-block; padding: 18px 35px; background: #2196F3; color: white; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 15px;">
                ✉️ CLICK HERE to Email Admin
              </a>
              
              <p style="color: #666; margin-top: 15px; font-size: 14px;">
                <strong>Works in:</strong> Gmail, Outlook, Yahoo, Apple Mail, Thunderbird
              </p>
            </div>

            <!-- Response Time Table -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #4CAF50;">
              <h3>⏱️ Response Time Expectations</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
                <tr style="background: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; width: 50%;"><strong>Issue Type</strong></td>
                  <td style="padding: 12px; border: 1px solid #ddd; width: 50%;"><strong>Expected Response</strong></td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">🔴 Critical / System Down</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">Within 2 hours</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">🟡 Account / Login Issues</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">Within 12 hours</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">🟢 General Questions</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">Within 24 hours</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">📅 Weekend Support</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">Within 48 hours</td>
                </tr>
              </table>
            </div>

            <!-- Multiple Contact Options -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📧 Different Contact Options:</h3>
              
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                <a href="${mailtoLinks.urgent}" 
                   style="flex: 1; min-width: 120px; padding: 12px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold;">
                  🚨 Emergency
                </a>
                <a href="${mailtoLinks.bug}" 
                   style="flex: 1; min-width: 120px; padding: 12px; background: #ffc107; color: black; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold;">
                  🐛 Bug Report
                </a>
                <a href="${mailtoLinks.feature}" 
                   style="flex: 1; min-width: 120px; padding: 12px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold;">
                  💡 Feature Request
                </a>
                <a href="${mailtoLinks.general}" 
                   style="flex: 1; min-width: 120px; padding: 12px; background: #6c757d; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold;">
                  ❓ General Help
                </a>
              </div>
              
              <p style="color: #666; font-size: 13px; margin-top: 15px;">
                <strong>Tip:</strong> Different links pre-fill different email templates
              </p>
            </div>

            <!-- Manual Instructions -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📝 Manual Email Instructions:</h3>
              <p>If links don't work in your email client:</p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                <p><strong>Email Address:</strong> contact.medicheck@gmail.com</p>
                <p><strong>Subject:</strong> Start with "[Medicheck Support]"</p>
                <p><strong>Include:</strong> Username (${user.username}), Role (${user.role}), Issue description</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              <p>Medicheck Support Team</p>
              <p>© ${new Date().getFullYear()} Medicheck Blockchain Medicine Tracker</p>
            </div>
          </div>
        </div>
      `,
      text: `
Medicheck Support Information

Hello ${user.name},

Here is your support contact information:

🛎️ QUICK CONTACT:
Click the link in the email to open a pre-filled email to admin.

⏱️ RESPONSE TIME:
- Critical/System Down: Within 2 hours
- Account/Login Issues: Within 12 hours  
- General Questions: Within 24 hours
- Weekend Support: Within 48 hours

📧 CONTACT OPTIONS:
- Emergency: Click emergency link
- Bug Report: Click bug report link
- Feature Request: Click feature request link
- General Help: Click general help link

📝 MANUAL OPTION (if links don't work):
Email: contact.medicheck@gmail.com
Subject: Start with "[Medicheck Support]"
Include: Username (${user.username}), Role (${user.role}), Issue description

This is an automated message.
      `.trim()
    };
  }
};
