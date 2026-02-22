import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendNewsletterLeadEmail(params: {
  to: string;
  subscriberEmail: string;
  locale: string;
  ip: string;
  userAgent: string;
}) {
  if (!resend || !process.env.FROM_EMAIL) {
    throw new Error("Email delivery is not configured.");
  }

  const submittedAt = new Date().toISOString();
  const safeSubscriberEmail = escapeHtml(params.subscriberEmail);
  const safeLocale = escapeHtml(params.locale);
  const safeIp = escapeHtml(params.ip);
  const safeAgent = escapeHtml(params.userAgent);

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: params.to,
    subject: `New newsletter subscription: ${params.subscriberEmail}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 640px; margin: 0 auto; color: #102C26;">
        <h1 style="margin-bottom: 12px;">New newsletter subscription</h1>
        <p><strong>Email:</strong> ${safeSubscriberEmail}</p>
        <p><strong>Locale:</strong> ${safeLocale}</p>
        <p><strong>IP:</strong> ${safeIp}</p>
        <p><strong>User agent:</strong> ${safeAgent}</p>
        <p><strong>Submitted at:</strong> ${submittedAt}</p>
      </div>
    `
  });
}

export async function sendOrderEmail(params: {
  to: string;
  orderId: string;
  total: string;
  shippingInfo: string;
  items: Array<{ name: string; quantity: number; price: string }>;
}) {
  if (!resend || !process.env.FROM_EMAIL) return;

  const itemsHtml = params.items
    .map((item) => `<li>${item.name} x ${item.quantity} - $${item.price}</li>`)
    .join("");

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: params.to,
    subject: `Order Confirmation #${params.orderId}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #102C26;">
        <h1 style="margin-bottom: 8px;">Thank you for your purchase</h1>
        <p>Your order <strong>#${params.orderId}</strong> has been confirmed.</p>
        <h2 style="margin-top: 24px;">Order Summary</h2>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> $${params.total}</p>
        <h2 style="margin-top: 24px;">Shipping</h2>
        <p style="white-space: pre-line">${params.shippingInfo}</p>
      </div>
    `
  });
}

export async function sendVerificationEmail(params: { to: string; name?: string | null; verifyUrl: string }) {
  if (!resend || !process.env.FROM_EMAIL) return;

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: params.to,
    subject: "Verify your Furni Enterprise account",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #102C26;">
        <h1 style="margin-bottom: 10px;">Confirm your email</h1>
        <p>Hello ${params.name || "there"},</p>
        <p>Please confirm your account by clicking the button below. This link expires in 24 hours.</p>
        <p style="margin: 20px 0;">
          <a href="${params.verifyUrl}" style="background:#102C26;color:#F7E7CE;padding:10px 18px;border-radius:999px;text-decoration:none;">Verify email</a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(params: { to: string; name?: string | null; resetUrl: string }) {
  if (!resend || !process.env.FROM_EMAIL) return;

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: params.to,
    subject: "Reset your Furni Enterprise password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #102C26;">
        <h1 style="margin-bottom: 10px;">Password reset</h1>
        <p>Hello ${params.name || "there"},</p>
        <p>Use the button below to reset your password. This link expires in 1 hour.</p>
        <p style="margin: 20px 0;">
          <a href="${params.resetUrl}" style="background:#102C26;color:#F7E7CE;padding:10px 18px;border-radius:999px;text-decoration:none;">Reset password</a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}
