import { Request } from "express-jwt";
import { Response } from "express";

export const botWebHookHandler = async (
	req: Request,
	res: Response
) => {
	console.log(`botId: ${req.params.botId}`);
	console.log(req.body);

	return res.status(200).json({ message: "OK" });
};

export const removeBotWebHook = async (
	req: Request,
	res: Response
) => {
	console.log(`botId: ${req.params.botId}`);
	console.log(req.body);

	return res.status(200).json({ message: "OK" });
};
