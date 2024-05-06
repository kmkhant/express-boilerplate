import { Router } from "express";
import { botWebHookHandler } from "@/controllers/webhook.controller";

const router = Router();

router.post("/:botId", botWebHookHandler);

export default router;
