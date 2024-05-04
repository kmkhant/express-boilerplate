import express from "express";

import {
	createProject,
	getProjectsByAdmin,
	updateProject,
	addChannelToProject,
	deleteChannelFromProject,
	deleteProject,
	transferProject,
	addGroupToProject,
} from "@/controllers/project.controller";

import { addBotToProject } from "@/controllers/bot.controller";

const router = express.Router();

// projects CRUD
router.post("/create", createProject);
router.get("/", getProjectsByAdmin);
router.patch("/:projectId/update", updateProject);
router.delete("/:projectId/delete", deleteProject);
router.patch("/:projectId/transfer", transferProject);

// channel CRUD
router.post("/:projectId/addChannel", addChannelToProject);
router.delete(
	"/:projectId/deleteChannel/:channelId",
	deleteChannelFromProject
);

// group CRUD
router.post("/:projectId/addGroup", addGroupToProject);

// bot CRUD to project
router.post("/:projectId/addBot", addBotToProject); // update bot token if bot already exists

export default router;
