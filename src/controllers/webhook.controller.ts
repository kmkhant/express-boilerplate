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
	const botId = req.params;

	// fetch bot token from db via botId
	const { token } = req.body;

	console.log(token);

	try {
		// remove bot webhook
		const resp = await fetch(
			`https://api.telegram.org/bot${token}/setWebhook?url=`,
			{
				method: "POST",
			}
		);

		if (resp.status === 200) {
			return res
				.status(200)
				.json({ message: "OK, webhook deletion succeed" });
		} else {
			return res
				.status(500)
				.json({ message: "Failed to delete webhook" });
		}
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};
