import { Request as JWTRequest } from "express-jwt";
import { Response } from "express";

// models
import PlanModel, {
	PLAN_DURATION,
} from "@/models/plan.model";
import UserModel from "@/models/user.model";
import SubscriptionModel from "@/models/subscription.model";
import ChannelModel from "@/models/channel.model";
import GroupModel from "@/models/group.model";

// auth type
import { IAuth, IAuthBot } from "@/types";
import AdminModel from "@/models/admin.model";

export const createSubscription = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const { chatId, planId, channelId, groupId, user } =
		req.body;

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		if (!currentAdmin) {
			return res.status(404).json({
				message: "Admin not found",
			});
		}

		if (!chatId || !planId || !user) {
			return res.status(400).json({
				message: "Invalid Request",
			});
		}

		const currentPlan = await PlanModel.findById({
			_id: planId,
		});

		if (!currentPlan) {
			return res
				.status(404)
				.json({ message: "plan not found" });
		}

		// subscription period
		const startDate = new Date();
		const endDate = new Date();

		if (!currentPlan) {
			return res.status(404).json({
				message: "Plan not found",
			});
		}

		switch (currentPlan.plan_duration) {
			case PLAN_DURATION.WEEK:
				endDate.setDate(startDate.getDate() + 7);
				break;
			case PLAN_DURATION.TWO_WEEKS:
				endDate.setDate(startDate.getDate() + 14);
				break;
			case PLAN_DURATION.MONTH:
				endDate.setDate(startDate.getDate() + 30);
				break;
			case PLAN_DURATION.TWO_MONTH:
				endDate.setDate(startDate.getDate() + 60);
				break;
			case PLAN_DURATION.THREE_MONTH:
				endDate.setDate(startDate.getDate() + 90);
				break;
			case PLAN_DURATION.SIX_MONTH:
				endDate.setDate(startDate.getDate() + 180);
				break;
			case PLAN_DURATION.YEAR:
				endDate.setDate(startDate.getDate() + 365);
				break;
			case PLAN_DURATION.LIFETIME:
				endDate.setDate(startDate.getDate() + 36500);
				break;
		}

		const currentUser = await UserModel.findOne({
			id: user.id,
		});

		if (channelId && groupId) {
			return res.status(400).json({
				message: "provide only channelId or groupId",
			});
		}

		if (!channelId && !groupId) {
			return res.status(400).json({
				message:
					"Invalid Request provide channel id or group id",
			});
		}

		// create channel subscription
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
						plan: currentPlan,
						channel: currentChannel,
						user: newUser,
						startDate,
						endDate,
					});

				await UserModel.findOneAndUpdate(
					{
						id: newUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription,
						},
					}
				);

				return res.status(200).json({
					message:
						"Channel Subscription created for new user",
				});
			} else {
				const currentSubscription =
					await SubscriptionModel.findOne({
						user: currentUser._id,
						channel: currentChannel._id,
					});

				if (currentSubscription) {
					return res.status(401).json({
						message:
							"User already subscribed to this channel",
					});
				}

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

				await UserModel.findOneAndUpdate(
					{
						id: currentUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription,
						},
					}
				);

				return res.status(200).json({
					message:
						"Channel subscription created for existing user",
				});
			}
		} else if (groupId) {
			// create group subscription
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
						group: currentGroup._id,
						user: newUser._id,
						startDate,
						endDate,
					});

				await UserModel.findOneAndUpdate(
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
						group: currentGroup._id,
						user: currentUser._id,
						startDate,
						endDate,
					});

				await UserModel.findOneAndUpdate(
					{
						id: currentUser.id,
					},
					{
						$push: {
							subscriptions: newSubscription,
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

// To delete subscription, we need to find the subscription by id and remove it from the user's subscriptions array.
// To do that use a cron job to check if the subscription has expired and remove it from the user's subscriptions array.
// Make sure to cancel the subscription on the payment gateway as well.
// We will make endpoints to cancel the subscription manually as well for the admin.
export const deleteChannelSubscriptionByUserId = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { userId, channelId } = req.params;

	if (!channelId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (!userId) {
		return res
			.status(400)
			.json({ message: "user id is required" });
	}

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		const currentUser = await UserModel.findOne({
			id: userId,
		});

		if (!currentAdmin) {
			return res
				.status(401)
				.json({ message: "Unauthorized" });
		}
		const currentChannel = await ChannelModel.findOne({
			id: channelId,
		}).populate("admin");

		if (!currentUser) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		if (!currentChannel) {
			return res
				.status(404)
				.json({ message: "Channel not found" });
		}

		if (
			currentChannel.admin instanceof AdminModel &&
			!currentChannel.admin._id.equals(currentAdmin._id)
		) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		const currentSubscription =
			await SubscriptionModel.findOne({
				user: currentUser,
				channel: currentChannel,
			});

		if (!currentSubscription) {
			return res.status(404).json({
				message:
					"Subscription not found by user for this channel by user ID",
			});
		}

		// delete subscription
		await SubscriptionModel.findByIdAndDelete({
			_id: currentSubscription._id,
		});

		return res.status(200).json({
			message:
				"OK, deleted channel subscription by user ID",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

export const deleteChannelSubscriptionByUsername = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { username, channelId } = req.params;

	if (!channelId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (!username) {
		return res
			.status(400)
			.json({ message: "user id is required" });
	}

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		const currentUser = await UserModel.findOne({
			username: username,
		});

		if (!currentAdmin) {
			return res
				.status(401)
				.json({ message: "Unauthorized" });
		}
		const currentChannel = await ChannelModel.findOne({
			id: channelId,
		}).populate("admin");

		if (!currentUser) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		if (!currentChannel) {
			return res
				.status(404)
				.json({ message: "Channel not found" });
		}

		if (
			currentChannel.admin instanceof AdminModel &&
			!currentChannel.admin._id.equals(currentAdmin._id)
		) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		const currentSubscription =
			await SubscriptionModel.findOne({
				user: currentUser,
				channel: currentChannel,
			});

		if (!currentSubscription) {
			return res.status(404).json({
				message:
					"Subscription not found by user for this channel by username",
			});
		}

		// delete subscription
		await SubscriptionModel.findByIdAndDelete({
			_id: currentSubscription._id,
		});

		return res.status(200).json({
			message:
				"OK, deleted channel subscription by username",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

export const deleteGroupSubscriptionByUserId = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { userId, groupId } = req.params;

	if (!groupId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (!userId) {
		return res
			.status(400)
			.json({ message: "user id is required" });
	}

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		const currentUser = await UserModel.findOne({
			id: userId,
		});

		if (!currentAdmin) {
			return res
				.status(401)
				.json({ message: "Unauthorized" });
		}
		const currentGroup = await GroupModel.findOne({
			id: groupId,
		}).populate("admin");

		if (!currentUser) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		if (!currentGroup) {
			return res
				.status(404)
				.json({ message: "Channel not found" });
		}

		if (
			currentGroup.admin instanceof AdminModel &&
			!currentGroup.admin._id.equals(currentAdmin._id)
		) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		const currentSubscription =
			await SubscriptionModel.findOne({
				user: currentUser,
				channel: currentGroup,
			});

		if (!currentSubscription) {
			return res.status(404).json({
				message:
					"Subscription not found by user for this group by userId",
			});
		}

		// delete subscription
		await SubscriptionModel.findByIdAndDelete({
			_id: currentSubscription._id,
		});

		return res.status(200).json({
			message: "OK, deleted group subscription by userId",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

export const deleteGroupSubscriptionByUsername = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;
	const { username, groupId } = req.params;

	if (!groupId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (!username) {
		return res
			.status(400)
			.json({ message: "user id is required" });
	}

	const adminId = userInfo.id;

	try {
		const currentAdmin = await AdminModel.findOne({
			id: adminId,
		});

		const currentUser = await UserModel.findOne({
			username: username,
		});

		if (!currentAdmin) {
			return res
				.status(401)
				.json({ message: "Unauthorized" });
		}
		const currentGroup = await GroupModel.findOne({
			id: groupId,
		}).populate("admin");

		if (!currentUser) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		if (!currentGroup) {
			return res
				.status(404)
				.json({ message: "Channel not found" });
		}

		if (
			currentGroup.admin instanceof AdminModel &&
			!currentGroup.admin._id.equals(currentAdmin._id)
		) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		const currentSubscription =
			await SubscriptionModel.findOne({
				user: currentUser,
				channel: currentGroup,
			});

		if (!currentSubscription) {
			return res.status(404).json({
				message:
					"Subscription not found by user for this group by username",
			});
		}

		// delete subscription
		await SubscriptionModel.findByIdAndDelete({
			_id: currentSubscription._id,
		});

		return res.status(200).json({
			message: "OK, deleted group subscription by username",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

// bot secret will need to access this endpoint
// this endpoint will be used to update the subscription of a user
// therefore, restrict admin access to this endpoint, only allow for our bot
export const updateChannelSubscriptionByUserId = async (
	req: JWTRequest,
	res: Response
) => {
	const { botSecret } = req.auth as IAuthBot;
	const { userId, channelId } = req.params;
	const { planId } = req.body;

	if (!channelId || !userId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (botSecret !== process.env.BOT_SECRET) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const currentUser = await UserModel.findOne({
		id: userId,
	});

	const currentPlan = await PlanModel.findOne({
		_id: planId,
	});

	if (!currentPlan) {
		return res.status(404).json({
			message: "Plan not found",
		});
	}

	if (!currentUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	const currentChannel = await ChannelModel.findOne({
		id: channelId,
	});

	if (!currentChannel) {
		return res.status(404).json({
			message: "Channel not found",
		});
	}

	const currentSubscription =
		await SubscriptionModel.findOne({
			user: currentUser,
			channel: currentChannel,
		});

	if (!currentSubscription) {
		return res.status(404).json({
			message: "Subscription not found",
		});
	}

	// update subscription
	const planDuration = currentPlan.plan_duration;
	const currentEndDate = currentSubscription.endDate;

	switch (planDuration) {
		case PLAN_DURATION.WEEK:
			currentEndDate.setDate(currentEndDate.getDate() + 7);
			break;
		case PLAN_DURATION.TWO_WEEKS:
			currentEndDate.setDate(currentEndDate.getDate() + 14);
			break;
		case PLAN_DURATION.MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 30);
			break;
		case PLAN_DURATION.TWO_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 60);
			break;
		case PLAN_DURATION.THREE_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 90);
			break;
		case PLAN_DURATION.SIX_MONTH:
			currentEndDate.setDate(
				currentEndDate.getDate() + 180
			);
			break;
		case PLAN_DURATION.YEAR:
			currentEndDate.setDate(
				currentEndDate.getDate() + 365
			);
			break;
		case PLAN_DURATION.LIFETIME:
			currentEndDate.setDate(
				currentEndDate.getDate() + 36500
			);
			break;
	}

	await SubscriptionModel.findOneAndUpdate(
		{
			_id: currentSubscription._id,
		},
		{
			endDate: currentEndDate,
		}
	);

	return res
		.status(200)
		.json({ message: "OK, updated subscription" });
};

export const updateChannelSubscriptionByUsername = async (
	req: JWTRequest,
	res: Response
) => {
	const { botSecret } = req.auth as IAuthBot;
	const { username, channelId } = req.params;
	const { planId } = req.body;

	if (!channelId || !username) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (botSecret !== process.env.BOT_SECRET) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const currentUser = await UserModel.findOne({
		username: username,
	});

	const currentPlan = await PlanModel.findOne({
		_id: planId,
	});

	if (!currentPlan) {
		return res.status(404).json({
			message: "Plan not found",
		});
	}

	if (!currentUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	const currentChannel = await ChannelModel.findOne({
		id: channelId,
	});

	if (!currentChannel) {
		return res.status(404).json({
			message: "Channel not found",
		});
	}

	const currentSubscription =
		await SubscriptionModel.findOne({
			user: currentUser,
			channel: currentChannel,
		});

	if (!currentSubscription) {
		return res.status(404).json({
			message: "Subscription not found",
		});
	}

	// update subscription
	const planDuration = currentPlan.plan_duration;
	const currentEndDate = currentSubscription.endDate;

	switch (planDuration) {
		case PLAN_DURATION.WEEK:
			currentEndDate.setDate(currentEndDate.getDate() + 7);
			break;
		case PLAN_DURATION.TWO_WEEKS:
			currentEndDate.setDate(currentEndDate.getDate() + 14);
			break;
		case PLAN_DURATION.MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 30);
			break;
		case PLAN_DURATION.TWO_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 60);
			break;
		case PLAN_DURATION.THREE_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 90);
			break;
		case PLAN_DURATION.SIX_MONTH:
			currentEndDate.setDate(
				currentEndDate.getDate() + 180
			);
			break;
		case PLAN_DURATION.YEAR:
			currentEndDate.setDate(
				currentEndDate.getDate() + 365
			);
			break;
		case PLAN_DURATION.LIFETIME:
			currentEndDate.setDate(
				currentEndDate.getDate() + 36500
			);
			break;
	}

	await SubscriptionModel.findOneAndUpdate(
		{
			_id: currentSubscription._id,
		},
		{
			endDate: currentEndDate,
		}
	);

	return res
		.status(200)
		.json({ message: "OK, updated subscription" });
};

export const updateGroupSubscriptionByUserId = async (
	req: JWTRequest,
	res: Response
) => {
	const { botSecret } = req.auth as IAuthBot;
	const { userId, groupId } = req.params;
	const { planId } = req.body;

	if (!groupId || !userId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (botSecret !== process.env.BOT_SECRET) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const currentUser = await UserModel.findOne({
		id: userId,
	});

	const currentPlan = await PlanModel.findOne({
		_id: planId,
	});

	if (!currentPlan) {
		return res.status(404).json({
			message: "Plan not found",
		});
	}

	if (!currentUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	const currentGroup = await GroupModel.findOne({
		id: groupId,
	});

	if (!currentGroup) {
		return res.status(404).json({
			message: "Channel not found",
		});
	}

	const currentSubscription =
		await SubscriptionModel.findOne({
			user: currentUser,
			group: currentGroup,
		});

	if (!currentSubscription) {
		return res.status(404).json({
			message: "Subscription not found",
		});
	}

	// update subscription
	const planDuration = currentPlan.plan_duration;
	const currentEndDate = currentSubscription.endDate;

	switch (planDuration) {
		case PLAN_DURATION.WEEK:
			currentEndDate.setDate(currentEndDate.getDate() + 7);
			break;
		case PLAN_DURATION.TWO_WEEKS:
			currentEndDate.setDate(currentEndDate.getDate() + 14);
			break;
		case PLAN_DURATION.MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 30);
			break;
		case PLAN_DURATION.TWO_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 60);
			break;
		case PLAN_DURATION.THREE_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 90);
			break;
		case PLAN_DURATION.SIX_MONTH:
			currentEndDate.setDate(
				currentEndDate.getDate() + 180
			);
			break;
		case PLAN_DURATION.YEAR:
			currentEndDate.setDate(
				currentEndDate.getDate() + 365
			);
			break;
		case PLAN_DURATION.LIFETIME:
			currentEndDate.setDate(
				currentEndDate.getDate() + 36500
			);
			break;
	}

	await SubscriptionModel.findOneAndUpdate(
		{
			_id: currentSubscription._id,
		},
		{
			endDate: currentEndDate,
		}
	);

	return res
		.status(200)
		.json({
			message: "OK, updated group subscription by userId",
		});
};

export const updateGroupSubscriptionByUsername = async (
	req: JWTRequest,
	res: Response
) => {
	const { botSecret } = req.auth as IAuthBot;
	const { username, groupId } = req.params;
	const { planId } = req.body;

	if (!groupId || !username) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	if (botSecret !== process.env.BOT_SECRET) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const currentUser = await UserModel.findOne({
		username: username,
	});

	const currentPlan = await PlanModel.findOne({
		_id: planId,
	});

	if (!currentPlan) {
		return res.status(404).json({
			message: "Plan not found",
		});
	}

	if (!currentUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	const currentGroup = await GroupModel.findOne({
		id: groupId,
	});

	if (!currentGroup) {
		return res.status(404).json({
			message: "Channel not found",
		});
	}

	const currentSubscription =
		await SubscriptionModel.findOne({
			user: currentUser,
			channel: currentGroup,
		});

	if (!currentSubscription) {
		return res.status(404).json({
			message: "Subscription not found",
		});
	}

	// update subscription
	const planDuration = currentPlan.plan_duration;
	const currentEndDate = currentSubscription.endDate;

	switch (planDuration) {
		case PLAN_DURATION.WEEK:
			currentEndDate.setDate(currentEndDate.getDate() + 7);
			break;
		case PLAN_DURATION.TWO_WEEKS:
			currentEndDate.setDate(currentEndDate.getDate() + 14);
			break;
		case PLAN_DURATION.MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 30);
			break;
		case PLAN_DURATION.TWO_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 60);
			break;
		case PLAN_DURATION.THREE_MONTH:
			currentEndDate.setDate(currentEndDate.getDate() + 90);
			break;
		case PLAN_DURATION.SIX_MONTH:
			currentEndDate.setDate(
				currentEndDate.getDate() + 180
			);
			break;
		case PLAN_DURATION.YEAR:
			currentEndDate.setDate(
				currentEndDate.getDate() + 365
			);
			break;
		case PLAN_DURATION.LIFETIME:
			currentEndDate.setDate(
				currentEndDate.getDate() + 36500
			);
			break;
	}

	await SubscriptionModel.findOneAndUpdate(
		{
			_id: currentSubscription._id,
		},
		{
			endDate: currentEndDate,
		}
	);

	return res
		.status(200)
		.json({
			message:
				"OK, updated group subscription by username ",
		});
};
