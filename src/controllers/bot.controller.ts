import AdminModel from "@/models/admin.model";
import ProjectModel from "@/models/project.model";
import { IAuth } from "@/types";
import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";
import BotModel from "@/models/bot.model";

// create bot handler
export const addProjectBot = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { projectId } = req.params;
	const { botId, botName, botUsername, token, webhookURL } =
		req.body;

	const adminId = userInfo.id;

	if (!token) {
		return res.status(400).json({
			message: "Invalid Request",
		});
	}

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		if (!currentAdmin) {
			return res.status(404).json({
				message: "Admin not found",
			});
		}

		const currentProject = await ProjectModel.findOne({
			_id: projectId,
		});

		if (!currentProject) {
			return res.status(404).json({
				message: "Project not found",
			});
		}

		// check if admin is owner of the project
		if (!currentProject.admin.equals(currentAdmin._id)) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		// check if bot already exists in the project
		if (currentProject.bot) {
			return res.status(400).json({
				message:
					"Bot already exists in the project, use update bot endpoint",
			});
		}

		// create new bot
		const newBot = await BotModel.create({
			id: botId,
			name: botName,
			username: botUsername,
			token,
			webhookURL,
			admin: currentAdmin,
			project: currentProject,
		});

		// update project with bot
		await ProjectModel.findOneAndUpdate(
			{
				_id: projectId,
			},
			{
				bot: newBot,
			}
		);

		return res.status(201).json({
			message: "connected with bot",
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

// update handler
export const updateProjectBot = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { projectId } = req.params;
	const { botId, botName, botUsername, token, webhookURL } =
		req.body;

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		const currentProject = await ProjectModel.findOne({
			_id: projectId,
		});

		if (!currentProject) {
			return res.status(404).json({
				message: "Project not found",
			});
		}

		if (!currentAdmin) {
			return res.status(404).json({
				message: "Admin not found",
			});
		}

		// check if admin is owner of the project
		if (currentProject.admin.equals(currentAdmin._id)) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		// check if bot is already exists in the project
		if (currentProject.bot) {
			// delete current bot
			await BotModel.findOneAndDelete({
				_id: currentProject.bot,
			});

			// update current project with new bot
			const newBot = await BotModel.findOne({
				id: botId,
				name: botName,
				username: botUsername,
				token,
				webhookURL,
				admin: currentAdmin,
				project: currentProject,
			});

			await ProjectModel.findOneAndUpdate(
				{
					_id: projectId,
				},
				{
					bot: newBot,
				}
			);
			return res
				.status(200)
				.json({ message: "bot updated successfully" });
		}

		return res
			.status(400)
			.json({ message: "project has no bot to update" });
	} catch (e) {
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};
