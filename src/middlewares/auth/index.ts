import { expressjwt } from "express-jwt";

export const authMiddleware = expressjwt({
	secret: process.env.JWT_SECRET || "",
	algorithms: ["HS256"],
});
