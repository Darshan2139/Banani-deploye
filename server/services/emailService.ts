// @ts-ignore -- nodemailer types load after dependencies install
import nodemailer from "nodemailer";

type NodeEnv = Record<string, string | undefined>;

const env =
  ((globalThis as typeof globalThis & { process?: { env?: NodeEnv } }).process?.env as NodeEnv | undefined) ?? {};

const smtpHost = env.SMTP_HOST;
const smtpUser = env.SMTP_USER;
const smtpPassword = env.SMTP_PASSWORD;
const smtpPort = parseInt(env.SMTP_PORT || "587", 10);
const smtpSecure = env.SMTP_SECURE === "true" ? true : env.SMTP_SECURE === "false" ? false : smtpPort === 465;

if (!smtpHost || !smtpUser || !smtpPassword) {
  console.warn("SMTP environment variables missing. Email sending will fail until they are set.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
  tls: env.SMTP_IGNORE_TLS_ERRORS === "true" ? { rejectUnauthorized: false } : undefined,
});

// Warm up transporter once so we catch configuration issues on cold start
transporter.verify().catch((error) => {
  console.error("SMTP verification failed:", error);
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `BananiExpense <${smtpUser ?? ""}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
}
