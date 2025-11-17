import { Prisma, RequestStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const createRequestSchema = z.object({
  requesterId: z.string().cuid("Invalid requester id").optional(),
  pickupLocationId: z.string().cuid("Invalid pickup location id"),
  dropLocationId: z.string().cuid("Invalid drop location id"),
  taskType: z.string().min(2),
  preferredTime: z.string().datetime().optional(),
  instructions: z.string().max(512).optional(),
  estimatedCost: z.number().nonnegative().optional()
});

const statusQuerySchema = z.object({
  status: z.nativeEnum(RequestStatus).optional()
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus)
});

router.post("/", async (req, res, next) => {
  const authUser = (req as AuthenticatedRequest).user;
  const parsed = createRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    if (authUser && ![UserRole.STUDENT, UserRole.STAFF].includes(authUser.role)) {
      return res.status(403).json({ message: "Only students or staff may create requests" });
    }

    const requesterId = authUser?.userId ?? parsed.data.requesterId;

    if (!requesterId) {
      return res.status(400).json({ message: "Requester id is required" });
    }

    const { pickupLocationId, dropLocationId, taskType, preferredTime, instructions, estimatedCost } =
      parsed.data;

    const request = await prisma.request.create({
      data: {
        requesterId,
        pickupLocationId,
        dropLocationId,
        taskType,
        preferredTime: preferredTime ? new Date(preferredTime) : null,
        instructions,
        estimatedCost: estimatedCost ? new Prisma.Decimal(estimatedCost) : undefined
      },
      include: {
        pickupLocation: true,
        dropLocation: true
      }
    });

    return res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  const parsed = statusQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const requests = await prisma.request.findMany({
      where: {
        status: parsed.data.status
      },
      include: {
        requester: true,
        runner: true,
        pickupLocation: true,
        dropLocation: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      data: requests,
      meta: { count: requests.length }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: req.params.id },
      include: {
        requester: true,
        runner: true,
        pickupLocation: true,
        dropLocation: true,
        events: {
          orderBy: { timestamp: "desc" }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const request = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
        events: {
          create: {
            status: parsed.data.status
          }
        }
      }
    });

    res.json(request);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Request not found" });
    }
    next(error);
  }
});

export default router;
