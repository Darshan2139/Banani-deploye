import { RequestHandler } from 'express';
import { sendEmail } from '../services/emailService';
import { createSignupTemplate, createPasswordResetTemplate, createLoginNotificationTemplate, createNewEntryTemplate, createMonthlyEarningsTemplate, createPaymentDueTemplate } from '../services/emailTemplates';

export interface SendEmailRequest {
  type: 'signup' | 'password-reset' | 'login' | 'new-entry' | 'monthly-earnings' | 'payment-due';
  to: string;
  firstName: string;
  [key: string]: string | number;
}

export const handleSendEmail: RequestHandler = async (req, res) => {
  try {
    const { type, to, firstName, ...data } = req.body as SendEmailRequest;

    let emailTemplate;

    switch (type) {
      case 'signup':
        emailTemplate = createSignupTemplate(firstName, to);
        break;
      case 'password-reset':
        emailTemplate = createPasswordResetTemplate(firstName, data.resetLink as string);
        break;
      case 'login':
        emailTemplate = createLoginNotificationTemplate(firstName, data.timestamp as string);
        break;
      case 'new-entry':
        emailTemplate = createNewEntryTemplate(
          firstName,
          data.date as string,
          parseFloat(data.weight as string),
          parseFloat(data.earnings as string),
          data.currency as string
        );
        break;
      case 'monthly-earnings':
        emailTemplate = createMonthlyEarningsTemplate(
          firstName,
          data.month as string,
          parseFloat(data.totalEarnings as string),
          parseFloat(data.totalWeight as string),
          parseInt(data.entryCount as string)
        );
        break;
      case 'payment-due':
        emailTemplate = createPaymentDueTemplate(
          firstName,
          data.dueDate as string,
          parseFloat(data.amount as string)
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    await sendEmail({
      to,
      ...emailTemplate,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email endpoint error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
