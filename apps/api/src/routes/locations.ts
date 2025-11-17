import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" }
    });

    res.json({ data: locations });
  } catch (error) {
    next(error);
  }
});

export default router;
