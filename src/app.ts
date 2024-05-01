import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import connection from "./database/connection";
import * as middlewares from "./middlewares";
import projectRoutes from "@/controllers/project/project.routes";
import MessageResponse from "./interfaces/MessageResponse";
import { authMiddleware } from "./middlewares/auth";

require("dotenv").config();

const app = express();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
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

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
