import prisma from "../db/prisma";

export const injectConversations = async (users: any) => {
    try {

        const usersWithConversations = await Promise.all(users.map(async (user: any) => {
            const conversations = await prisma.conversation.findMany({
                where: {
                    participantsIds: {
                        has: user.id,
                    },
                },
                select: {
                    id: true,
                    participantsIds: true,
                    updatedAt: true,
                    messages: {
                        select: {
                            id: true,
                            body: true,
                            createdAt: true,
                            senderId: true,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 1, // only take the last message
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
            });
            return { ...user, conversations };
        }));

        return usersWithConversations;
    } catch (error) {
        console.log("Error while injecting names in conversations: ", error);
    }
}