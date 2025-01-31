import jwt from 'jsonwebtoken'
import { Response } from 'express';

const SECRET = process.env.JWT_SECRETE;

// export const generateTokenSetCookie = (id: number, role: string, username: string, email: string, res: Response) => {
//     try {
//         const token = jwt.sign({ id, role, username, email }, SECRET!, {
//             expiresIn: "1d"
//         })
//         res.cookie("jwt", token, {
//             maxAge: 1 * 24 * 60 * 60 * 1000, //millisecs
//             httpOnly: true, // prevent xss cross-site scripting
//             sameSite: "strict", //prevent csrf attack cross-site request forgery
//             secure: process.env.NODE_ENV !== "development" //HTTPS
//         })
//         return token
//     } catch (error: any) {
//         console.log("ERROR while making token: ", error.message)
//     }
// }


export const generateToken = (id: number, role: string, username: string, email: string) => {
    try {
        const token = jwt.sign({ id, role, username, email }, SECRET!, {
            expiresIn: "1d",
        });
        return token;
    } catch (error: any) {
        console.error("ERROR while making token: ", error.message);
        return null;
    }
};
