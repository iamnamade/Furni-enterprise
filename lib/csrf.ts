export function isValidCsrfRequest(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;

  const isProd = process.env.NODE_ENV === "production";
  const host = request.headers.get("host");

  const allowedOrigins = new Set<string>();

  for (const value of [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXTAUTH_URL]) {
    if (!value) continue;
    try {
      allowedOrigins.add(new URL(value).origin);
    } catch {
      // ignore malformed env values
    }
  }

  // In local/dev we allow host-based origins for convenience.
  if (!isProd && host) {
    allowedOrigins.add(`https://${host}`);
    allowedOrigins.add(`http://${host}`);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    if (origin) {
      const originUrl = new URL(origin);
      return allowedOrigins.has(originUrl.origin);
    }
    if (referer) {
      const refererUrl = new URL(referer);
      return allowedOrigins.has(refererUrl.origin);
    }
    return false;
  } catch {
    return false;
  }
}
