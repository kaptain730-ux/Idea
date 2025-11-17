import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET ?? "dev-refresh-secret";
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL ?? "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL ?? "7d";

export type JwtPayload = {
  userId: string;
  role: User["role"];
  email?: string | null;
};

export function signAccessToken(user: User) {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(user: User) {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload & jwt.JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload & jwt.JwtPayload;
}
