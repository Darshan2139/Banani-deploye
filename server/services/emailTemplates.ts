export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function createSignupTemplate(firstName: string, email: string): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to BananiExpense! 🍌</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Your account has been successfully created with the email <strong>${email}</strong>.</p>
            <p>You can now log in and start tracking your banana earnings with ease!</p>
            <p><a href="${process.env.VITE_APP_URL || 'https://bananiexpense.com'}/login" class="button">Login Now</a></p>
            <p>Happy tracking! 📊</p>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to BananiExpense! 🍌

Hi ${firstName},

Your account has been successfully created with the email ${email}.

You can now log in and start tracking your banana earnings with ease!

Login Now: ${process.env.VITE_APP_URL || 'https://bananiexpense.com'}/login

Happy tracking! 📊

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: '🍌 Welcome to BananiExpense - Account Created',
    html: html.trim(),
    text: text.trim(),
  };
}

export function createPasswordResetTemplate(firstName: string, resetLink: string): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your BananiExpense password. Click the button below to reset it:</p>
            <p><a href="${resetLink}" class="button">Reset Password</a></p>
            <div class="warning">
              <strong>⚠️ Didn't request this?</strong><br>
              If you didn't request a password reset, you can safely ignore this email. Your password will not change unless you click the link above.
            </div>
            <p>This link expires in 1 hour.</p>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Password Reset Request

Hi ${firstName},

We received a request to reset your BananiExpense password. Click the link below to reset it:

${resetLink}

⚠️ Didn't request this?
If you didn't request a password reset, you can safely ignore this email. Your password will not change unless you click the link above.

This link expires in 1 hour.

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: '🔐 Reset Your BananiExpense Password',
    html: html.trim(),
    text: text.trim(),
  };
}

export function createLoginNotificationTemplate(firstName: string, timestamp: string): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .info-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected ✅</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Your BananiExpense account was just logged into.</p>
            <div class="info-box">
              <strong>Login Time:</strong> ${timestamp}<br>
              <strong>Location:</strong> Browser
            </div>
            <p>If this wasn't you, please change your password immediately.</p>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
New Login Detected ✅

Hi ${firstName},

Your BananiExpense account was just logged into.

Login Time: ${timestamp}

If this wasn't you, please change your password immediately.

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: '✅ New Login to Your BananiExpense Account',
    html: html.trim(),
    text: text.trim(),
  };
}

export function createNewEntryTemplate(firstName: string, date: string, weight: number, earnings: number, currency: string = 'INR'): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6; }
          .stat-label { color: #666; font-size: 12px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Entry Recorded! 📝</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Your new banana delivery entry has been recorded successfully!</p>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-label">Date</div>
                <div class="stat-value">${date}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Weight</div>
                <div class="stat-value">${weight.toFixed(2)} kg</div>
              </div>
            </div>
            <div class="stat-box" style="grid-column: 1 / -1;">
              <div class="stat-label">Earnings</div>
              <div class="stat-value">₹${earnings.toFixed(2)}</div>
            </div>
            <p style="margin-top: 20px;">Keep tracking to see your earnings grow! 💰</p>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
New Entry Recorded! 📝

Hi ${firstName},

Your new banana delivery entry has been recorded successfully!

Date: ${date}
Total Weight: ${weight.toFixed(2)} kg
Earnings: ₹${earnings.toFixed(2)}

Keep tracking to see your earnings grow! 💰

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: '📝 New Entry Recorded - BananiExpense',
    html: html.trim(),
    text: text.trim(),
  };
}

export function createMonthlyEarningsTemplate(firstName: string, month: string, totalEarnings: number, totalWeight: number, entryCount: number): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b; text-align: center; }
          .stat-label { color: #666; font-size: 12px; }
          .stat-value { font-size: 20px; font-weight: bold; color: #b45309; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monthly Earnings Summary 📊</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Here's your earnings summary for <strong>${month}</strong>:</p>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-label">Total Earnings</div>
                <div class="stat-value">₹${totalEarnings.toFixed(2)}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Weight</div>
                <div class="stat-value">${totalWeight.toFixed(0)} kg</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Entries</div>
                <div class="stat-value">${entryCount}</div>
              </div>
            </div>
            <p style="text-align: center; color: #666;">Great work! Keep up the momentum! 🚀</p>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Monthly Earnings Summary 📊

Hi ${firstName},

Here's your earnings summary for ${month}:

Total Earnings: ₹${totalEarnings.toFixed(2)}
Total Weight: ${totalWeight.toFixed(0)} kg
Entries: ${entryCount}

Great work! Keep up the momentum! 🚀

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: `📊 Your ${month} Earnings Summary - BananiExpense`,
    html: html.trim(),
    text: text.trim(),
  };
}

export function createPaymentDueTemplate(firstName: string, dueDate: string, amount: number): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .amount-box { background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #ef4444; margin: 15px 0; }
          .amount-value { font-size: 32px; font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Due Reminder ⏰</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>This is a reminder that a payment is due.</p>
            <div class="amount-box">
              <div style="color: #666; font-size: 14px; margin-bottom: 5px;">Amount Due</div>
              <div class="amount-value">₹${amount.toFixed(2)}</div>
              <div style="color: #666; font-size: 14px; margin-top: 10px;">Due Date: <strong>${dueDate}</strong></div>
            </div>
            <div class="alert">
              <strong>⏰ Important:</strong> Please ensure payment is made by the due date to avoid any issues.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 BananiExpense. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Payment Due Reminder ⏰

Hi ${firstName},

This is a reminder that a payment is due.

Amount Due: ₹${amount.toFixed(2)}
Due Date: ${dueDate}

⏰ Important: Please ensure payment is made by the due date to avoid any issues.

© 2025 BananiExpense. All rights reserved.
  `;

  return {
    subject: `⏰ Payment Due Reminder - BananiExpense`,
    html: html.trim(),
    text: text.trim(),
  };
}
