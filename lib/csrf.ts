export function isValidCsrfRequest(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  const allowedOrigins = new Set<string>();
  allowedOrigins.add(`https://${host}`);
  allowedOrigins.add(`http://${host}`);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    allowedOrigins.add(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.NEXTAUTH_URL) {
    allowedOrigins.add(process.env.NEXTAUTH_URL);
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
