import { Request, Response } from "express"
import prisma from "../db/prisma"
import bcryptjs from "bcryptjs"
import { generateToken } from "../utils/generateToken"
import { changeUserStatus } from "../utils/changeUserStatus";

export const signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, username, password, confirmPassword, timezone } = req?.body

        if (!email || !username || !password || !confirmPassword) {
            return res.status(400).json({ error: "Please fill in all fields" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords don't match" })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const randomProfilePic = 'https://avatar.iran.liara.run/public';

        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                profilePic: randomProfilePic,
                timeZone: timezone,
            }
        })
        if (newUser) {
            //  generate token in a sec
            const token = generateToken(newUser.id, newUser.role, newUser.username, newUser.email)
            res.header('Authorization', `Bearer ${token}`);

            res.status(201).json({
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                profilePic: newUser.profilePic,
                role: newUser.role,
                isOnline: newUser.isOnline,
            });
        }
        else {
            res.status(400).json({ error: "Invalid user data" })
        }
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
};
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }
        const isPwCorrect = await bcryptjs.compare(password, user.password);
        if (!isPwCorrect) {
            return res.status(400).json({ error: "Invalid credentials" })
        }
        const token = generateToken(user.id, user.role, user.username, user.email)
        const userOnline = await changeUserStatus(user.id, true)
        res.header('Authorization', `Bearer ${token}`);
        res.status(200).json({
            id: userOnline.id,
            email: userOnline.email,
            username: userOnline.username,
            profilePic: userOnline.profilePic,
            role: userOnline.role,
            isOnline: userOnline.isOnline
        },)
    }
    catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
};
export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        await changeUserStatus(req.user.id, false)
        res.header('Authorization', '');
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server error" })
    }
};
export const changeTime = async (req: Request, res: Response): Promise<any> => {
    try {
        const { startAt, endAt, id } = req.body;
        const setTime = await prisma.allowedTime.update({
            where: { id: parseInt(id) },
            data: { startAt: startAt, endAt: endAt }
        });
        res.status(200).json({ time: setTime });
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
};