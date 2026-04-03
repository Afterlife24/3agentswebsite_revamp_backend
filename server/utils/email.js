import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to, otp, purpose = "verify") {
  const subject = purpose === "verify"
    ? "Autonomiq — Verify Your Email"
    : "Autonomiq — Reset Your Password";

  const html = `
    <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a2a3a;border-radius:16px;color:#fff;">
      <h2 style="margin:0 0 8px;color:#22d3ee;">Autonomiq</h2>
      <p style="color:#cbd5e1;font-size:14px;">
        ${purpose === "verify" ? "Your email verification code is:" : "Your password reset code is:"}
      </p>
      <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px 0;color:#fff;">
        ${otp}
      </div>
      <p style="color:#94a3b8;font-size:12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Autonomiq" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
