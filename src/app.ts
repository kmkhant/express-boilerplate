import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import connection from "./database/connection";
import * as middlewares from "./middlewares";
import MessageResponse from "./interfaces/MessageResponse";
import { authMiddleware } from "./middlewares/auth";
import { botWebHookHandler } from "@/controllers/webhook.controller";

// Routes
import projectRoutes from "@/routes/project.routes";
import planRoutes from "@/routes/plan.routes";
import subscriptionRoutes from "@/routes/subscription.routes";
import webHookRoutes from "@/routes/webhook.routes";

require("dotenv").config();

const app = express();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// public access from telegram to hook - TODO - encrypt/hash the uri
app.use("/api/v1/bot/webhook/:botId", botWebHookHandler);

app.use(authMiddleware);

// DB connection
connection();

app.get<{}, MessageResponse>("/", (req, res) => {
	res.json({
		message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
	});
});

// routes
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/subscriptions/plan", planRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

// web hook management
app.use("/api/v1/bot/webhook-mgmt", webHookRoutes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
