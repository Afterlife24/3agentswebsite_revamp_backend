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

export async function sendWaitlistConfirmationEmail(to, name) {
  const subject = "Welcome to Autonomiq Waitlist! 🎉";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#0a2a3a;border-radius:16px;color:#fff;">
      <h2 style="margin:0 0 16px;color:#22d3ee;font-size:28px;">Welcome to Autonomiq!</h2>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        Hi ${name},
      </p>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        Thank you for joining our waitlist! We're thrilled to have you on board. 🚀
      </p>
      
      <div style="background:#0f3a4f;padding:24px;border-radius:12px;margin:24px 0;border-left:4px solid #22d3ee;">
        <p style="color:#fff;font-size:16px;margin:0;line-height:1.6;">
          You're now on the list to be among the first to experience our AI-powered solutions that will transform how you work.
        </p>
      </div>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        <strong style="color:#22d3ee;">What's next?</strong><br/>
        • We'll keep you updated on our progress<br/>
        • You'll get early access when we launch<br/>
        • Exclusive updates and behind-the-scenes content
      </p>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        In the meantime, feel free to explore our website and learn more about what we're building.
      </p>
      
      <div style="text-align:center;margin:32px 0;">
        <a href="https://autonomiq.ae" style="display:inline-block;background:#22d3ee;color:#0a2a3a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          Visit Our Website
        </a>
      </div>
      
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-top:32px;padding-top:24px;border-top:1px solid #1e4a5f;">
        Best regards,<br/>
        <strong style="color:#22d3ee;">The Autonomiq Team</strong>
      </p>
      
      <p style="color:#64748b;font-size:12px;margin-top:24px;">
        If you didn't sign up for our waitlist, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Autonomiq" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendCompanyDetailsConfirmationEmail(to, companyName) {
  const subject = "Thank You for Your Interest in Autonomiq! 🚀";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#0a2a3a;border-radius:16px;color:#fff;">
      <h2 style="margin:0 0 16px;color:#22d3ee;font-size:28px;">Thank You for Reaching Out!</h2>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        Hello,
      </p>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        Thank you for submitting your company details to Autonomiq! We've received your information and are excited to learn more about ${companyName || 'your company'}.
      </p>
      
      <div style="background:#0f3a4f;padding:24px;border-radius:12px;margin:24px 0;border-left:4px solid #22d3ee;">
        <p style="color:#fff;font-size:16px;margin:0;line-height:1.6;">
          <strong>We will contact you soon!</strong><br/>
          Our team is reviewing your submission and will reach out to you shortly to discuss how our AI-powered solutions can help transform your business.
        </p>
      </div>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        <strong style="color:#22d3ee;">What happens next?</strong><br/>
        • Our team will review your requirements<br/>
        • We'll schedule a personalized demo<br/>
        • You'll receive a tailored solution proposal
      </p>
      
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        In the meantime, feel free to explore our AI agents and see how they can revolutionize your workflow:
      </p>
      
      <div style="margin:24px 0;">
        <div style="background:#0f3a4f;padding:16px;border-radius:8px;margin-bottom:12px;">
          <strong style="color:#22d3ee;">🌐 Web Agent</strong><br/>
          <span style="color:#cbd5e1;font-size:14px;">24/7 intelligent customer support on your website</span>
        </div>
        <div style="background:#0f3a4f;padding:16px;border-radius:8px;margin-bottom:12px;">
          <strong style="color:#9b59b6;">📞 Voice Agent</strong><br/>
          <span style="color:#cbd5e1;font-size:14px;">AI-powered phone calls that sound human</span>
        </div>
        <div style="background:#0f3a4f;padding:16px;border-radius:8px;">
          <strong style="color:#25D366;">💬 WhatsApp Agent</strong><br/>
          <span style="color:#cbd5e1;font-size:14px;">Automated conversations on WhatsApp</span>
        </div>
      </div>
      
      <div style="text-align:center;margin:32px 0;">
        <a href="https://autonomiq.ae" style="display:inline-block;background:#22d3ee;color:#0a2a3a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          Explore Our Solutions
        </a>
      </div>
      
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-top:32px;padding-top:24px;border-top:1px solid #1e4a5f;">
        Best regards,<br/>
        <strong style="color:#22d3ee;">The Autonomiq Team</strong><br/>
        <a href="mailto:support@autonomiq.ae" style="color:#22d3ee;text-decoration:none;">support@autonomiq.ae</a>
      </p>
      
      <p style="color:#64748b;font-size:12px;margin-top:24px;">
        If you didn't submit this form, please contact us immediately at support@autonomiq.ae
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Autonomiq" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
