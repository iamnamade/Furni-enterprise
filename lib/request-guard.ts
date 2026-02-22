export function isPayloadTooLarge(request: Request, maxBytes: number) {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const value = Number(raw);
  if (!Number.isFinite(value)) return false;
  return value > maxBytes;
}

export function hasJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType) return false;
  return contentType.toLowerCase().includes("application/json");
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const value = (forwarded || realIp || "unknown").split(",")[0].trim();
  return value || "unknown";
}

const CUID_REGEX = /^c[a-z0-9]{24}$/;

export function isValidCuid(value: string) {
  return CUID_REGEX.test(value);
}
