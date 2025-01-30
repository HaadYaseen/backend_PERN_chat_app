import { Request, Response } from "express"
import prisma from "../db/prisma"
import bcryptjs from "bcryptjs"
import generateTokenSetCookie, { generateToken } from "../utils/generateToken"
// import { DateTime } from "luxon"

export const signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, username, password, confirmPassword, timeZone } = req?.body

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
                timeZone,
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
            });
        }
        else {
            res.status(400).json({ error: "Invalid user data" })
        }
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
}
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
        res.header('Authorization', `Bearer ${token}`);
        res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            profilePic: user.profilePic,
            token: token
        },)
    }
    catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
}
export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server error" })
    }
}
export const getMe = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.status(200).json({
            id: user?.id,
            username: user?.username,
            email: user?.email,
            profilePic: user?.profilePic
        })
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
}
export const changeTime = async (req: Request, res: Response): Promise<any> => {
    try {
        const { startAt, endAt, id } = req.body;

        // const startAtInt = parseInt(startAt);
        // const endAtInt = parseInt(endAt);
        // if (isNaN(startAtInt) || isNaN(endAtInt)) {
        //     return res.status(400).json({ error: "Invalid time" })
        // }
        const setTime = await prisma.allowedTime.update({
            where: { id: parseInt(id) },
            data: { startAt: startAt, endAt: endAt }
        });
        res.status(200).json({ time: setTime })
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
}
export const createTime = async (req: Request, res: Response): Promise<any> => {
    try {
        const { startAt, endAt } = req.body;

        // const startAtInt = parseInt(startAt);
        // const endAtInt = parseInt(endAt);
        // if (isNaN(startAtInt) || isNaN(endAtInt)) {
        //     return res.status(400).json({ error: "Invalid time" })
        // }
        const setTime = await prisma.allowedTime.create({
            data: { startAt: startAt, endAt: endAt }
        });
        res.status(200).json({ time: setTime })
    } catch (error: any) {
        console.log("ERROR: ", error.message)
        res.status(500).json({ error: "Internal Server error" })
    }
} // remove this api to avoid clash ( make a seeder file instead with dummy default time and update it using the update api)