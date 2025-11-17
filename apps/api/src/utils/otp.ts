import crypto from "crypto";

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
