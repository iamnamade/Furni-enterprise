declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export async function getRecaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    return process.env.NODE_ENV !== "production" ? "dev-bypass-token" : "";
  }
  if (typeof window === "undefined" || !window.grecaptcha) return "";

  return new Promise<string>((resolve) => {
    window.grecaptcha?.ready(async () => {
      const token = await window.grecaptcha!.execute(siteKey, { action });
      resolve(token);
    });
  });
}
