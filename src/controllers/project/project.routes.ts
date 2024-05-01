import express from "express";

import {
	createProject,
	getProjectsByAdmin,
	updateProject,
} from "./project.controller";

const router = express.Router();

router.get("/", getProjectsByAdmin);
router.post("/", createProject);
router.put("/:id", updateProject);

export default router;
