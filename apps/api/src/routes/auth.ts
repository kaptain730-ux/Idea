import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { generateOtpCode, hashOtpCode } from "../utils/otp";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

const router = Router();

const sendSchema = z.object({
  contact: z.string().email("Provide a valid email")
});

const verifySchema = z.object({
  contact: z.string().email("Provide a valid email"),
  code: z.string().length(6, "OTP code must be 6 digits")
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

router.post("/otp/send", async (req, res, next) => {
  const parsed = sendSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const { contact } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: contact } });

    if (!user) {
      return res.status(404).json({ message: "No user found for this email" });
    }

    const code = generateOtpCode();

    await prisma.otpRequest.create({
      data: {
        contact,
        codeHash: hashOtpCode(code),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    res.json({ message: "OTP generated", previewCode: code });
  } catch (error) {
    next(error);
  }
});

router.post("/otp/verify", async (req, res, next) => {
  const parsed = verifySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const { contact, code } = parsed.data;

    const otpRequest = await prisma.otpRequest.findFirst({
      where: {
        contact,
        consumed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!otpRequest || otpRequest.codeHash !== hashOtpCode(code)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await prisma.otpRequest.update({
      where: { id: otpRequest.id },
      data: { consumed: true }
    });

    const user = await prisma.user.findUnique({ where: { email: contact } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, _next) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/me", requireAuth(), async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
});

export default router;
