/* eslint-disable @typescript-eslint/naming-convention */

import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";
import ChannelModel from "@/models/channel.model";
import PlanModel from "@/models/plan.model";
import ProjectModel from "@/models/project.model";
import { IAuth } from "@/types";
import AdminModel from "@/models/admin.model";

interface IAddPlan {
	name: string;
	description?: string;
	plan_duration: string;
	price: number;
}

export const addPlanToProject = async (
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

		const admin = currentProject.admin;

		const plan = await PlanModel.create({
			name,
			description,
			plan_duration,
			price,
			admin,
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
	const { planId } = req.params;
	const { channelId, projectId } = req.body;

	if (!planId || !channelId || !projectId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: projectId,
	});

	const adminId = userInfo.id;

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	// check if requested user is admin of project
	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentProject.admin.id !== adminId
	) {
		return res
			.status(401)
			.json({ message: "You don't own this project" });
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
		_id: planId,
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

	return res.status(200).json({ message: "Channel added" });
};

export const removeChannelFromPlan = async (
	req: JWTRequest,
	res: Response
) => {
	try {
		const { planId } = req.params;
		const { channelId, projectId } = req.body;
		const { userInfo } = req.auth as IAuth;

		if (!planId || !channelId || !projectId) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		const adminId = userInfo.id;

		const currentProject = await ProjectModel.findOne({
			_id: projectId,
		});

		if (!currentProject) {
			return res
				.status(404)
				.json({ message: "Project not found" });
		}

		// check if requested user is admin of project
		if (
			currentProject &&
			currentProject.admin instanceof AdminModel &&
			currentProject.admin.id !== adminId
		) {
			return res
				.status(401)
				.json({ message: "You don't own this project" });
		}

		const channelToRemove = await ChannelModel.findOne({
			id: channelId,
		});

		if (!channelToRemove) {
			return res
				.status(404)
				.json({ message: "Channel not found" });
		}

		const currentPlan = await PlanModel.findOne({
			_id: planId,
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
				$pull: {
					channels: channelToRemove._id,
				},
			}
		);

		return res
			.status(200)
			.json({ message: "Channel removed" });
	} catch (error) {
		console.log(error);

		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

export const editPlanNameOrDescription = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { planId } = req.params;
	const { name, description } = req.body;

	try {
		if (!planId) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		if (name || description) {
			const currentPlan = await PlanModel.findOne({
				_id: planId,
			});

			if (!currentPlan) {
				return res
					.status(404)
					.json({ message: "Plan not found" });
			}

			const currentAdmin = await AdminModel.findOne({
				id: userInfo.id,
			});

			if (!currentAdmin) {
				return res
					.status(404)
					.json({ message: "Admin not found" });
			}

			if (!currentAdmin._id.equals(currentPlan.admin)) {
				return res
					.status(401)
					.json({ message: "You don't own this plan" });
			}

			await PlanModel.updateOne(
				{
					_id: planId,
				},
				{
					name,
					description,
				}
			);

			return res
				.status(200)
				.json({ message: "Plan update success" });
		} else {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}
	} catch (error) {
		console.log(error);

		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

export const deletePlan = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { planId } = req.params;

	try {
		if (!planId) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		const currentPlan = await PlanModel.findOne({
			_id: planId,
		});

		if (!currentPlan) {
			return res
				.status(404)
				.json({ message: "Plan not found" });
		}

		const currentAdmin = await AdminModel.findOne({
			id: userInfo.id,
		});

		if (!currentAdmin) {
			return res
				.status(404)
				.json({ message: "Admin not found" });
		}

		if (!currentAdmin._id.equals(currentPlan.admin)) {
			return res
				.status(401)
				.json({ message: "You don't own this plan" });
		}

		await PlanModel.deleteOne({
			_id: planId,
		});

		return res
			.status(200)
			.json({ message: "Plan deleted" });
	} catch (error) {
		console.log(error);

		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};
