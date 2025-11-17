import { PrismaClient, UserRole, RequestStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

const STUDENT_ID = "student-demo-id";
const RUNNER_ID = "runner-demo-id";

const seedLocations = [
  { name: "Main Library", latitude: 28.6129, longitude: 77.2295, type: "academic" },
  { name: "North Hostel", latitude: 28.6139, longitude: 77.2216, type: "hostel" },
  { name: "Central Canteen", latitude: 28.6145, longitude: 77.2268, type: "canteen" }
];

async function main() {
  const [requester, runner] = await Promise.all([
    prisma.user.upsert({
      where: { email: "demo@campusdash.test" },
      update: {},
      create: {
        id: STUDENT_ID,
        name: "Demo Student",
        email: "demo@campusdash.test",
        role: UserRole.STUDENT
      }
    }),
    prisma.user.upsert({
      where: { email: "runner@campusdash.test" },
      update: {},
      create: {
        id: RUNNER_ID,
        name: "Demo Runner",
        email: "runner@campusdash.test",
        role: UserRole.RUNNER
      }
    })
  ]);

  await prisma.runnerProfile.upsert({
    where: { userId: RUNNER_ID },
    update: {},
    create: {
      userId: RUNNER_ID,
      governmentId: "RUNNER-DEMO-001",
      status: "approved"
    }
  });

  await prisma.location.createMany({
    data: seedLocations,
    skipDuplicates: true
  });

  const pickup = await prisma.location.findFirst({ where: { name: "Main Library" } });
  const drop = await prisma.location.findFirst({ where: { name: "North Hostel" } });
  const canteen = await prisma.location.findFirst({ where: { name: "Central Canteen" } });

  if (pickup && drop) {
    await prisma.request.upsert({
      where: { id: "seed-request-1" },
      update: {},
      create: {
        id: "seed-request-1",
        requesterId: requester.id,
        pickupLocationId: pickup.id,
        dropLocationId: drop.id,
        taskType: "Parcel delivery",
        instructions: "Handle with care",
        events: {
          create: [{ status: RequestStatus.PENDING }]
        }
      }
    });
  }

  if (canteen && drop) {
    await prisma.request.upsert({
      where: { id: "seed-request-2" },
      update: {},
      create: {
        id: "seed-request-2",
        requesterId: requester.id,
        pickupLocationId: canteen.id,
        dropLocationId: drop.id,
        taskType: "Food pickup",
        status: RequestStatus.ASSIGNED,
        runnerId: runner.id,
        events: {
          create: [
            { status: RequestStatus.PENDING },
            { status: RequestStatus.ASSIGNED }
          ]
        }
      }
    });
  }

  if (pickup && canteen) {
    const completedRequest = await prisma.request.upsert({
      where: { id: "seed-request-3" },
      update: {},
      create: {
        id: "seed-request-3",
        requesterId: requester.id,
        pickupLocationId: pickup.id,
        dropLocationId: canteen.id,
        taskType: "Stationery order",
        status: RequestStatus.COMPLETED,
        runnerId: runner.id,
        actualCost: 180,
        events: {
          create: [
            { status: RequestStatus.PENDING },
            { status: RequestStatus.ASSIGNED },
            { status: RequestStatus.COMPLETED }
          ]
        }
      }
    });

    await prisma.payment.upsert({
      where: { id: "seed-payment-3" },
      update: {},
      create: {
        id: "seed-payment-3",
        requestId: completedRequest.id,
        userId: runner.id,
        amount: 220,
        status: PaymentStatus.SETTLED,
        method: PaymentMethod.WALLET,
        reference: "RUNNER-PAYOUT-001"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
