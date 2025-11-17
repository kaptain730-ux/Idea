import type { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";

export type AuthenticatedUser = {
  userId: string;
  role: UserRole;
  email?: string | null;
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateRequest: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return next();
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email
    };
  } catch {
    // ignore invalid token so downstream middleware can decide
  }

  next();
};

export function requireAuth(roles?: UserRole | UserRole[]): RequestHandler {
  const allowedRoles = Array.isArray(roles) ? roles : roles ? [roles] : undefined;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
