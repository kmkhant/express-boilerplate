import { Router } from "express";
import { removeBotWebHook } from "@/controllers/webhook.controller";

const router = Router();

router.delete("/:botId", removeBotWebHook);

export default router;
