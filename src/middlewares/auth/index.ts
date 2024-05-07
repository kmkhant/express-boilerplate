import { expressjwt } from "express-jwt";

export const authMiddleware = expressjwt({
	secret: process.env.JWT_SECRET as string,
	algorithms: ["HS256"],
});
