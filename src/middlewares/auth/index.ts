import { expressjwt } from "express-jwt";
import "dotenv/config";

export const authMiddleware = expressjwt({
	secret: process.env.JWT_SECRET as string,
	algorithms: ["HS256"],
});
