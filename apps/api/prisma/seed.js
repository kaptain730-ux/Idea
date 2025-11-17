"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const seedLocations = [
    { name: "Main Library", latitude: 28.6129, longitude: 77.2295, type: "academic" },
    { name: "North Hostel", latitude: 28.6139, longitude: 77.2216, type: "hostel" },
    { name: "Central Canteen", latitude: 28.6145, longitude: 77.2268, type: "canteen" }
];
async function main() {
    const requester = await prisma.user.upsert({
        where: { email: "demo@campusdash.test" },
        update: {},
        create: {
            name: "Demo Student",
            email: "demo@campusdash.test",
            role: client_1.UserRole.STUDENT
        }
    });
    await prisma.location.createMany({
        data: seedLocations,
        skipDuplicates: true
    });
    const pickup = await prisma.location.findFirst({ where: { name: "Main Library" } });
    const drop = await prisma.location.findFirst({ where: { name: "North Hostel" } });
    if (pickup && drop) {
        await prisma.request.create({
            data: {
                requesterId: requester.id,
                pickupLocationId: pickup.id,
                dropLocationId: drop.id,
                taskType: "Parcel delivery",
                instructions: "Handle with care"
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
