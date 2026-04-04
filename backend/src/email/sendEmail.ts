import nodemailer from "nodemailer";
import { env } from "../setup/env";

const transporter = nodemailer.createTransport({
  host: "smtp.fused.com",
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  return transporter.sendMail({
    from: `"Teammate Finder" <${env.EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}
