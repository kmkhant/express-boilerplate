import AdminModel from "@/models/admin.model";
import ProjectModel from "@/models/project.model";
import { IAuth } from "@/types";
import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";
import BotModel from "@/models/bot.model";

// combined update/create handler, fix later if needed
export const addBotToProject = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { projectId } = req.params;
	const { name, token } = req.body;

	const adminId = userInfo.id;

	if (!name || !token) {
		return res.status(400).json({
			message: "Invalid Request",
		});
	}

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
			// update the bot token
			await BotModel.findOneAndUpdate(
				{
					_id: currentProject.bot,
				},
				{
					name,
					token,
				}
			);
			return res
				.status(200)
				.json({ message: "Bot updated successfully" });
		} else {
			const newBot = new BotModel({
				name,
				token,
				admin: currentAdmin,
			});

			await newBot.save();

			await ProjectModel.findOneAndUpdate(
				{
					_id: projectId,
				},
				{
					bot: newBot._id,
				}
			);

			return res
				.status(201)
				.json({ message: "Bot added successfully" });
		}
	} catch (e) {
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};
