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
	removeGroupFromProject,
} from "@/controllers/project.controller";

import {
	addProjectBot,
	updateProjectBot,
} from "@/controllers/bot.controller";

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
router.patch(
	"/:projectId/removeGroup",
	removeGroupFromProject
);

// bot CRUD to project
router.post("/:projectId/addBot", addProjectBot); // add bot to project
router.post("/:projectId/updateBot", updateProjectBot); // update bot token if bot already exists

export default router;
