import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { userInfo } = req.body;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}
	next();
};
