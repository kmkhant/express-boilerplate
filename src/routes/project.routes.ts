import express from "express";

import {
	createProject,
	getProjectsByAdmin,
	updateProject,
	addChannelToProject,
	deleteChannelFromProject,
	deleteProject,
	transferProject,
} from "@/controllers/project.controller";

const router = express.Router();

// projects CRUD
router.post("/create", createProject);
router.get("/", getProjectsByAdmin);
router.patch("/update/:projectId", updateProject);
router.delete("/delete/:projectId", deleteProject);
router.patch("/transfer/:projectId", transferProject);

// channel CRUD
router.post("/:projectId/addChannel", addChannelToProject);
router.delete(
	"/:projectId/deleteChannel/:channelId",
	deleteChannelFromProject
);

export default router;
