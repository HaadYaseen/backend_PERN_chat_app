import prisma from "../src/db/prisma";
import bcryptjs from "bcryptjs"

const seedAdminUser = async () => {
    try {
        const email = "admin@gmail.com";
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash("12345678", salt);
        const randomProfilePic = 'https://avatar.iran.liara.run/public';
        const admin = await prisma.user.upsert({
            where: {
                email,
            },
            create: {
                email,
                username: "Admin",
                password: hashedPassword,
                role: "ADMIN",
                profilePic: randomProfilePic,
                timeZone: "Asia/Karachi"
            },
            update: {},
        });
        if (admin) {
            console.log("Admin user seeded successfully");
        }
    } catch (error) {
        console.log("Error while seeding admin user: ", error);
    }
};
seedAdminUser();