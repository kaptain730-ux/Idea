import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" }
    });

    res.json({
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
