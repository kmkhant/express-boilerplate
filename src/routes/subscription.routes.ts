import { Router } from "express";

// import controllers
import {
	createSubscription,
	updateChannelSubscriptionByUserId,
	updateChannelSubscriptionByUsername,
	updateGroupSubscriptionByUserId,
	updateGroupSubscriptionByUsername,
	deleteChannelSubscriptionByUserId,
	deleteChannelSubscriptionByUsername,
	deleteGroupSubscriptionByUserId,
	deleteGroupSubscriptionByUsername,
} from "@/controllers/subscription.controller";

const router = Router();

// define routes
// CREATE
router.post("/create", createSubscription);

// READ

// UPDATE
router.patch(
	"/channel/:channelId/userId/:userId/update",
	updateChannelSubscriptionByUserId
);
router.patch(
	"/channel/:channelId/username/:username/update",
	updateChannelSubscriptionByUsername
);
router.patch(
	"/group/:groupId/userId/:userId/update",
	updateGroupSubscriptionByUserId
);
router.patch(
	"/group/:groupId/username/:username/update",
	updateGroupSubscriptionByUsername
);

// DELETE
router.delete(
	"/channel/:channelId/userId/:userId/delete",
	deleteChannelSubscriptionByUserId
);
router.delete(
	"/channel/:channelId/username/:username/delete",
	deleteChannelSubscriptionByUsername
);
router.delete(
	"/group/:groupId/userId/:userId/delete",
	deleteGroupSubscriptionByUserId
);
router.delete(
	"/group/:groupId/username/:username/delete",
	deleteGroupSubscriptionByUsername
);

export default router;
