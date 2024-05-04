import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";

// models
import PlanModel from "@/models/plan.model";
import UserModel from "@/models/user.model";
import SubscriptionModel from "@/models/subscription.model";
import ChannelModel from "@/models/channel.model";
import GroupModel from "@/models/group.model";

// auth type
import { IAuth } from "@/types";

export const createSubscription = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const {
		chatId,
		planId,
		channelId,
		groupId,
		user,
		startDate,
		endDate,
	} = req.body;

	const adminId = userInfo.id;

	try {
		const currentAdmin = await UserModel.findById({
			id: adminId,
		});

		if (!currentAdmin) {
			return res.status(404).json({
				message: "Admin not found",
			});
		}

		if (
			!chatId ||
			!planId ||
			!user ||
			!startDate ||
			!endDate
		) {
			return res.status(400).json({
				message: "Invalid Request",
			});
		}

		const currentPlan = await PlanModel.findOne({
			_id: planId,
		});

		if (!currentPlan) {
			return res.status(404).json({
				message: "Plan not found",
			});
		}

		const currentUser = await UserModel.findOne({
			id: user.id,
		});

		if (channelId) {
			// add channel subscription
			const currentChannel = await ChannelModel.findOne({
				id: channelId,
			});

			if (!currentChannel) {
				return res.status(404).json({
					message: "Channel not found",
				});
			}

			if (!currentUser) {
				// add user, and add subscription
				const newUser = await UserModel.create({
					id: user.id,
					name: user.name,
					username: user.username,
				});

				const newSubscription =
					await SubscriptionModel.create({
						chatId,
						plan: currentPlan._id,
						channel: currentChannel._id,
						user: newUser._id,
						startDate,
						endDate,
					});

				await UserModel.findByIdAndUpdate(
					{
						id: newUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription._id,
						},
					}
				);

				return res.status(200).json({
					message:
						"Channel Subscription created for new user",
				});
			} else {
				// add subscription with existing user
				const newSubscription =
					await SubscriptionModel.create({
						chatId,
						plan: currentPlan._id,
						channel: currentChannel._id,
						user: currentUser._id,
						startDate,
						endDate,
					});

				await UserModel.findByIdAndUpdate(
					{
						id: currentUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription._id,
						},
					}
				);

				return res.status(200).json({
					message:
						"Channel subscription created for existing user",
				});
			}
		} else if (groupId) {
			// add group subscription
			const currentGroup = await GroupModel.findOne({
				id: groupId,
			});

			if (!currentGroup) {
				// add group subscription
				return res.status(404).json({
					message: "Group not found",
				});
			}

			if (!currentUser) {
				// add user, and add subscription
				const newUser = await UserModel.create({
					id: user.id,
					name: user.name,
					username: user.username,
				});

				const newSubscription =
					await SubscriptionModel.create({
						chatId,
						plan: currentPlan._id,
						channel: currentGroup._id,
						user: newUser._id,
						startDate,
						endDate,
					});

				await UserModel.findByIdAndUpdate(
					{
						id: newUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription._id,
						},
					}
				);

				return res.status(200).json({
					message:
						"Group subscription created for new user",
				});
			} else {
				// add subscription with existing user
				const newSubscription =
					await SubscriptionModel.create({
						chatId,
						plan: currentPlan._id,
						channel: currentGroup._id,
						user: currentUser._id,
						startDate,
						endDate,
					});

				await UserModel.findByIdAndUpdate(
					{
						id: currentUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription._id,
						},
					}
				);

				return res.status(200).json({
					message:
						"Group subscription created for existing user",
				});
			}
		} else {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};
