import transporter from "../config/mailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendMail = async ({ to, subject, text, html }: MailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Inngest TMS" <${process.env.MAILTRAP_SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("📧 Message sent:", info.messageId);
    return info;

  } catch (error: any) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};
