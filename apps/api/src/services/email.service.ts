import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const configured =
  Boolean(env.EMAIL_HOST) &&
  Boolean(env.EMAIL_PORT) &&
  Boolean(env.EMAIL_USER) &&
  Boolean(env.EMAIL_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!transporter) {
    console.warn(`Email disabled. ${subject} for ${to}: ${text}`);
    return { skipped: true };
  }
  await transporter.sendMail({
    from: env.EMAIL_FROM ?? "SplitMate <no-reply@splitmate.app>",
    to,
    subject,
    text,
    html,
  });
  return { skipped: false };
}

export const actionEmail = (message: string, actionUrl: string) => ({
  text: `${message}\n\n${actionUrl}`,
  html: `<p>${message}</p><p><a href="${actionUrl}">Open SplitMate</a></p>`,
});
