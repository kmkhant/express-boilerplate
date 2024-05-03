import express from "express";

// handlers
import { addPlan } from "./plan.controller";

const router = express.Router();

router.post("/add/:projectId", addPlan);

export default router;
// plan CRUD
