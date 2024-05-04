import express from "express";

// handlers
import {
	addPlanToProject,
	addChannelToPlan,
	removeChannelFromPlan,
	editPlanNameOrDescription,
	deletePlan,
} from "@/controllers/plan.controller";

const router = express.Router();

router.post("/add/:projectId", addPlanToProject);
router.patch("/:planId/addChannel", addChannelToPlan);
router.patch(
	"/:planId/removeChannel",
	removeChannelFromPlan
);
router.patch("/:planId/edit", editPlanNameOrDescription);
router.delete("/:planId/delete", deletePlan);

export default router;
// plan CRUD
