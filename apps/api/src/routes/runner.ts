import { PaymentStatus, Prisma, RequestStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const runnerIdSchema = z.object({
  runnerId: z.string().cuid("Invalid runner id")
});

const taskActionSchema = z.object({
  runnerId: z.string().cuid("Invalid runner id"),
  actualCost: z.number().nonnegative().optional()
});

router.get("/summary", async (req, res, next) => {
  const authUser = (req as AuthenticatedRequest).user;
  const parsed = runnerIdSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    if (authUser && authUser.role !== UserRole.RUNNER) {
      return res.status(403).json({ message: "Runner role required" });
    }

    const runnerId = authUser?.userId ?? parsed.data.runnerId;

    if (!runnerId) {
      return res.status(400).json({ message: "runnerId is required" });
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [completedCount, totalEarnings, weeklyEarnings, recentPayments] = await Promise.all([
      prisma.request.count({
        where: { runnerId, status: RequestStatus.COMPLETED }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { userId: runnerId, status: PaymentStatus.SETTLED }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          userId: runnerId,
          status: PaymentStatus.SETTLED,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.payment.findMany({
        where: { userId: runnerId, status: PaymentStatus.SETTLED },
        include: {
          request: {
            select: {
              taskType: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    res.json({
      completedCount,
      totalEarnings: totalEarnings._sum.amount ?? 0,
      weeklyEarnings: weeklyEarnings._sum.amount ?? 0,
      recentPayments: recentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        createdAt: payment.createdAt,
        taskType: payment.request?.taskType ?? "Task payout"
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get("/tasks", async (req, res, next) => {
  const authUser = (req as AuthenticatedRequest).user;
  const parsed = runnerIdSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const runnerId = authUser?.userId ?? parsed.data.runnerId;

  if (authUser && authUser.role !== UserRole.RUNNER) {
    return res.status(403).json({ message: "Runner role required" });
  }

  if (!runnerId) {
    return res.status(400).json({ message: "runnerId is required" });
  }

  try {
    const [available, assigned] = await Promise.all([
      prisma.request.findMany({
        where: { status: RequestStatus.PENDING },
        include: {
          requester: true,
          pickupLocation: true,
          dropLocation: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.request.findMany({
        where: {
          runnerId,
          status: { in: [RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS] }
        },
        include: {
          requester: true,
          pickupLocation: true,
          dropLocation: true
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    res.json({ available, assigned });
  } catch (error) {
    next(error);
  }
});

router.post("/tasks/:id/accept", async (req, res, next) => {
  const authUser = (req as AuthenticatedRequest).user;
  const parsed = runnerIdSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const runnerId = authUser?.userId ?? parsed.data.runnerId;

  if (authUser && authUser.role !== UserRole.RUNNER) {
    return res.status(403).json({ message: "Runner role required" });
  }

  if (!runnerId) {
    return res.status(400).json({ message: "runnerId is required" });
  }

  try {
    const request = await prisma.request.findUnique({ where: { id: req.params.id } });

    if (!request || request.status !== RequestStatus.PENDING) {
      return res.status(409).json({ message: "Task is no longer available" });
    }

    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        runnerId,
        status: RequestStatus.ASSIGNED,
        events: {
          create: { status: RequestStatus.ASSIGNED }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
});

router.post("/tasks/:id/complete", async (req, res, next) => {
  const authUser = (req as AuthenticatedRequest).user;
  const parsed = taskActionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const runnerId = authUser?.userId ?? parsed.data.runnerId;

  if (authUser && authUser.role !== UserRole.RUNNER) {
    return res.status(403).json({ message: "Runner role required" });
  }

  if (!runnerId) {
    return res.status(400).json({ message: "runnerId is required" });
  }

  try {
    const request = await prisma.request.findUnique({ where: { id: req.params.id } });

    if (!request || request.runnerId !== runnerId) {
      return res.status(403).json({ message: "You cannot complete this request" });
    }

    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        status: RequestStatus.COMPLETED,
        actualCost: parsed.data.actualCost,
        events: {
          create: { status: RequestStatus.COMPLETED }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
});

export default router;
