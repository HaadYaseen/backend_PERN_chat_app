import prisma from "../db/prisma"

export const changeUserStatus = async (id: number, status: boolean) => {
    try {
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                isOnline: status
            }
        })
        return user;
    } catch (error) {
        throw new Error("Error changing user status")
    }
}