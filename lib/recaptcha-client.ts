declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let recaptchaLoadPromise: Promise<void> | null = null;

function loadRecaptcha(siteKey: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (recaptchaLoadPromise) return recaptchaLoadPromise;

  recaptchaLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA")), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    recaptchaLoadPromise = null;
    throw error;
  });

  return recaptchaLoadPromise;
}

export async function getRecaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    return process.env.NODE_ENV !== "production" ? "dev-bypass-token" : "";
  }

  if (typeof window === "undefined") return "";

  try {
    await loadRecaptcha(siteKey);
  } catch {
    return "";
  }

  if (!window.grecaptcha) return "";

  return new Promise<string>((resolve) => {
    window.grecaptcha?.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(siteKey, { action });
        resolve(token);
      } catch {
        resolve("");
      }
    });
  });
}
