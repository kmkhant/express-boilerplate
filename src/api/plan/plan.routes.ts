import express from "express";

// handlers
import {
	addPlanToProject,
	addChannelToPlan,
	removeChannelFromPlan,
} from "./plan.controller";

const router = express.Router();

router.post("/add/:projectId", addPlanToProject);
router.patch("/:planId/addChannel", addChannelToPlan);
router.patch(
	"/:planId/removeChannel",
	removeChannelFromPlan
);

export default router;
// plan CRUD
