import prisma from "../db/prisma";

export const injectUserNames = async (users: any, conversations: any) => {
    try {
        // Fetch user details for participants (outside the loop for efficiency)
        const participantUsers = await prisma.user.findMany({
            where: {
                id: {
                    in: conversations.flatMap(c => c.participantsIds), // Get all participant IDs
                },
            },
            select: {
                id: true,
                username: true, // Or other user details you need
            },
        });

        const usersWithConversations = await Promise.all(
            users.map(async (user: any) => {
                const userConversations = conversations.filter(c => c.participantsIds.includes(user.id));

                const enrichedConversations = userConversations.map(conversation => {
                    const enrichedMessages = conversation.messages.map(message => ({
                        ...message,
                        sender: participantUsers.find(u => u.id === message.senderId)?.username || "Unknown", // Add sender's username
                    }));

                    const participantUsernames = conversation.participantsIds.map(participantId => {
                        const participant = participantUsers.find(u => u.id === participantId);
                        return participant ? participant.username : "Unknown"; // Handle cases where user might not be found.
                    });

                    return {
                        ...conversation,
                        messages: enrichedMessages,
                        participantUsernames: participantUsernames, // Add participant usernames
                    };
                });

                return { ...user, conversations: enrichedConversations };
            })
        );
        return usersWithConversations;
    } catch (error) {
        console.log("Error while injecting names in conversations: ", error);
    };
};