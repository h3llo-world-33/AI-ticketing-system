interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendMail = async ({ to, subject, text, html }: MailOptions) => {
  try {
    // Import transporter only when needed (at runtime)
    const getTransporter = await import("../config/mailer");
    const transporter = getTransporter.default();
    
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