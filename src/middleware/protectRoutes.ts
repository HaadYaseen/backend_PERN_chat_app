import jwt, { JwtPayload } from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";
import { DateTime } from "luxon";
import { checkAllowedTime } from "../utils/checkTime";

const SECRET = process.env.JWT_SECRETE;

interface decodedToken extends JwtPayload {
    userId: number
}

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: number;
            }
        }
    }
};

export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" })
        }
        const decoded = jwt.verify(token, SECRET!) as decodedToken;
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" })
        }
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: decoded?.id
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePic: true,
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        req.user = user;
        next()
    } catch (error) {
        console.log()
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" })
        }
        const decoded = jwt.verify(token, SECRET!) as decodedToken;

        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" })
        }
        const user = await prisma.user.findUnique({
            where: {
                id: decoded?.id
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePic: true,
                role: true
            }
        })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        if (user.role !== "ADMIN") {
            return res.status(401).json({ error: "Unauthorized - Not an admin" })
        }
        req.user = user;
        next()
    } catch (error) {
        console.log()
    }
};

export const isAllowedTime = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userTimeZone = await prisma.user.findFirstOrThrow({
            where: {
                email: req.body.email
            },
            select: {
                timeZone: true,
                role: true
            }
        });

        const allowedTime = await prisma.allowedTime.findFirstOrThrow({
            where: {
                id: 1
            }
        });
        // const isAllowed = true
        const startAt = DateTime.fromJSDate(allowedTime.startAt);
        const endAt = DateTime.fromJSDate(allowedTime.endAt);
        const isAllowed = checkAllowedTime(userTimeZone.timeZone, startAt, endAt);

        if (isAllowed || userTimeZone.role === "ADMIN") { // allow admin to login regardless of time
            next();
        } else {
            res.status(403).json({ message: 'Operation is currently not allowed.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
