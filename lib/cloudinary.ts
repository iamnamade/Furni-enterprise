import { createHash } from "crypto";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) throw new Error("CLOUDINARY_URL is missing");

  const parsed = new URL(raw);
  return {
    cloudName: parsed.hostname,
    apiKey: parsed.username,
    apiSecret: parsed.password
  };
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file: string, folder = "furni") {
  const cfg = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign = {
    folder,
    timestamp
  };

  const signature = signParams(paramsToSign, cfg.apiSecret);

  const form = new URLSearchParams({
    file,
    folder,
    timestamp,
    api_key: cfg.apiKey,
    signature
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    let reason = "Cloudinary upload failed";
    try {
      const payload = (await response.json()) as { error?: { message?: string } };
      if (payload?.error?.message) reason = payload.error.message;
    } catch {
      // ignore parse errors and keep default reason
    }
    throw new Error(reason);
  }

  const data = await response.json();
  return {
    publicId: data.public_id as string,
    secureUrl: data.secure_url as string
  };
}
