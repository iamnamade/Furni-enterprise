export async function verifyRecaptchaToken(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: form
    });

    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean; score?: number };
    return Boolean(data.success && (data.score === undefined || data.score >= 0.5));
  } catch {
    return false;
  }
}
