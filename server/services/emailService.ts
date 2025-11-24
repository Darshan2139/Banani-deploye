/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore - nodemailer types are only available after dependencies install
import nodemailer from "nodemailer";

type NodeEnv = Record<string, string | undefined>;

const env =
  ((globalThis as typeof globalThis & { process?: { env?: NodeEnv } }).process?.env as NodeEnv | undefined) ?? {};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromAddress: string;
  ignoreTlsErrors: boolean;
};

type MinimalTransporter = {
  sendMail: (payload: Record<string, unknown>) => Promise<unknown>;
  verify: () => Promise<void>;
};

let cachedConfig: SmtpConfig | null = null;
let transporterPromise: Promise<MinimalTransporter> | null = null;

function resolveConfig(): SmtpConfig {
  if (cachedConfig) return cachedConfig;

  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const password = env.SMTP_PASSWORD;
  const port = parseInt(env.SMTP_PORT || "587", 10);
  const secure =
    env.SMTP_SECURE === "true" ? true : env.SMTP_SECURE === "false" ? false : Number.isFinite(port) && port === 465;
  const fromAddress = env.SMTP_FROM || user || "";
  const ignoreTlsErrors = env.SMTP_IGNORE_TLS_ERRORS === "true";

  if (!host || !user || !password) {
    const missing = [
      host ? null : "SMTP_HOST",
      user ? null : "SMTP_USER",
      password ? null : "SMTP_PASSWORD",
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `SMTP is not fully configured. Missing environment variables: ${missing || "unknown"}. Please set them in Vercel.`,
    );
  }

  cachedConfig = {
    host,
    port,
    secure,
    user,
    password,
    fromAddress: fromAddress || user,
    ignoreTlsErrors,
  };

  return cachedConfig;
}

async function getTransporter(): Promise<MinimalTransporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const config = resolveConfig();
      const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
        tls: config.ignoreTlsErrors ? { rejectUnauthorized: false } : undefined,
      });

      try {
        await transport.verify();
      } catch (error) {
        console.error("SMTP verification failed:", error);
        throw new Error(
          "Unable to connect to the SMTP server. Double-check the host, port, username, password, and TLS settings.",
        );
      }

      return transport;
    })();
  }

  return transporterPromise;
}

export function isEmailConfigured(): boolean {
  try {
    resolveConfig();
    return true;
  } catch {
    return false;
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const config = resolveConfig();
    const transport = await getTransporter();
    await transport.sendMail({
      from: `BananiExpense <${config.fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error instanceof Error ? error : new Error("Failed to send email");
  }
}
