/* eslint-disable @typescript-eslint/naming-convention */

import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";
import ChannelModel from "@/models/channel.model";
import PlanModel from "@/models/plan.model";
import ProjectModel from "@/models/project.model";
import { IAuth } from "@/types";

interface IAddPlan {
	name: string;
	description?: string;
	plan_duration: string;
	price: number;
}

export const addPlan = async (
	req: JWTRequest,
	res: Response
) => {
	const { projectId } = req.params;

	try {
		const currentProject = await ProjectModel.findOne({
			_id: projectId,
		});

		if (!currentProject) {
			return res
				.status(404)
				.json({ message: "Project not found" });
		}

		const {
			name,
			description,
			plan_duration,
			price,
		}: IAddPlan = req.body;

		if (!name) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		if (!price) {
			return res
				.status(400)
				.json({ message: "Include a plan price" });
		}

		const plan = await PlanModel.create({
			name,
			description,
			plan_duration,
			price,
		});

		// add to project plans
		await ProjectModel.updateOne(
			{
				_id: projectId,
			},
			{
				$addToSet: {
					plans: plan,
				},
			}
		);

		return res.status(200).json(plan);
	} catch (error) {
		console.log(error);

		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

// TODO - not channel, add plan to project
export const addChannelToPlan = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	const { planId, channelId } = req.body;

	if (!planId || !channelId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const channelToAdd = await ChannelModel.findOne({
		id: channelId,
	});

	if (!channelToAdd) {
		return res
			.status(404)
			.json({ message: "Channel not found" });
	}

	const currentPlan = await PlanModel.findOne({
		id: planId,
	});

	if (!currentPlan) {
		return res
			.status(404)
			.json({ message: "Plan not found" });
	}

	await PlanModel.updateOne(
		{
			_id: planId,
		},
		{
			$addToSet: {
				channels: channelToAdd,
			},
		}
	);
};
