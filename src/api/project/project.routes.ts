import express from "express";

import {
	createProject,
	getProjectsByAdmin,
	updateProject,
	addChannelToProject,
	deleteChannelFromProject,
	deleteProject,
	transferProject,
} from "./project.controller";

const router = express.Router();

// projects CRUD
router.post("/create", createProject);
router.get("/", getProjectsByAdmin);
router.patch("/update/:projectId", updateProject);
router.delete("/delete/:projectId", deleteProject);
router.patch("/transfer/:projectId", transferProject);

// channel CRUD
router.put("/addChannel/:projectId", addChannelToProject);
router.delete(
	"/deleteChannel/:projectId/:channelId",
	deleteChannelFromProject
);

export default router;
