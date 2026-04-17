import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
let testEmailUser: string | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  const account = await nodemailer.createTestAccount();
  testEmailUser = account.user;
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"Teammate Finder" <${testEmailUser}>`,
    to,
    subject,
    text,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  console.log("Email preview URL:", previewUrl);
  return { info, previewUrl };
}
