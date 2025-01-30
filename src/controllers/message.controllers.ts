import { Request, Response } from "express"
import prisma from "../db/prisma";
import { getReceiverSocketId, io } from "../socket/socket";
import { injectConversations } from "../utils/injectConversations";

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const { id } = req.params;
        const senderId = req.user.id;

        let conversation = await prisma.conversation.findFirst({
            where: {
                participantsIds: {
                    hasEvery: [senderId, parseInt(id)],
                }
            }
        })

        if (!conversation) { // if conversation does not exist, create a new one
            conversation = await prisma.conversation.create({
                data: {
                    participantsIds: {
                        set: [senderId, parseInt(id)]
                    }
                }
            })
        }

        const newMessage = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id
            }
        })
        if (newMessage) {
            conversation = await prisma.conversation.update({
                where: {
                    id: conversation.id
                },
                data: {
                    messages: {
                        connect: {
                            id: newMessage.id
                        }
                    }
                }
            })
        };
        //socket io
        const receiverSocketId = getReceiverSocketId(id);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        };

        res.status(201).json(newMessage);
    } catch (error: any) {
        console.error("ERROR: ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
};

export const getMessages = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: UserToChatId } = req.body;
        const senderId = req.user.id;

        const conversation = await prisma.conversation.findFirst({
            where: {
                participantsIds: {
                    hasEvery: [senderId, parseInt(UserToChatId)]
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        })

        if (!conversation) {
            return res.status(200).json([]);
        }
        res.status(200).json(conversation.messages)
    } catch (error: any) {
        console.error("ERROR: ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
};

export const getUsersForSidebar = async (req: Request, res: Response) => {
    try {
        const authUserId = req.user.id;
        // const users = await prisma.user.findMany({
        //     where: {
        //         id: {
        //             not: authUserId
        //         }
        //     }, // to add pagination use skip and take
        //     select: {
        //         id: true,
        //         email: true,
        //         username: true,
        //         profilePic: true,
        //     }, // to get the last message of each conversation use include
        //     // include: {
        //     //     conversations: {
        //     //         select: {
        //     //             id: true,
        //     //             participantsIds: true,
        //     //             updatedAt: true,
        //     //             messages: {
        //     //                 select: {
        //     //                     id: true,
        //     //                     body: true,
        //     //                     createdAt: true,
        //     //                     senderId: true,
        //     //                 },
        //     //                 orderBy: {
        //     //                     createdAt: "desc"
        //     //                 },
        //     //                 take: 1
        //     //             }
        //     //         },
        //     //         orderBy: {
        //     //             updatedAt: "desc"
        //     //         }
        //     //     }
        //     // },
        // })
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: authUserId, // exclude the authenticated user
                },
            },
            select: {  // to add pagination use skip and take since it is a dummy api with small, pagination is not included
                id: true,
                email: true,
                username: true,
                profilePic: true,
            },
        });

        const usersWithConversations = await injectConversations(users);
        res.status(201).json(usersWithConversations);
    } catch (error: any) {
        console.error("ERROR: ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
};

export const allUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: req.user.id, // exclude the authenticated user
                },
            },
            skip: 0,
            take: 4, //taking only 4 users to keep it simple
        });
        // you can also add fields in user model to get details such as last person texted and last message sent at which time.
        const usersWithConversations = await injectConversations(users);
        console.log('usersWithConversations: ', usersWithConversations);
        const usersWithConversationsAndNames = await injectConversations(usersWithConversations);
        console.log('usersWithConversationsAndNames: ', usersWithConversationsAndNames);
        res.status(201).json(usersWithConversationsAndNames);
        // res.status(201).json(users)
    } catch (error: any) {
        console.error("ERROR: ", error.message)
        res.status(500).json({ error: "Internal server error" })
    };
};