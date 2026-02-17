export function isPayloadTooLarge(request: Request, maxBytes: number) {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const value = Number(raw);
  if (!Number.isFinite(value)) return false;
  return value > maxBytes;
}

