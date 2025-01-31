import prisma from "../src/db/prisma";

const seedTime = async () => {
    try {
        const now = new Date();
        const startAt = new Date(now);
        startAt.setHours(1, 0, 0, 0); // Set start time to 01:00 AM

        const endAt = new Date(now);
        endAt.setHours(24, 0, 0, 0); // Set end time to 24:00 (midnight)
        const time = await prisma.allowedTime.upsert({
            where: {
                id: 1,
            },
            create: {
                startAt: startAt.toISOString(),
                endAt: endAt.toISOString(),
            },
            update: {},
        });
        if (time) {
            console.log("Time settings seeded successfully");
        }
    } catch (error) {
        console.log("Error while seeding time: ", error);
    }
}
seedTime();