import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import * as middlewares from "./middlewares";
import MessageResponse from "./interfaces/MessageResponse";
import { authMiddleware } from "./middlewares/auth";
import "dotenv/config";

// Routes
// import projectRoutes from "@/routes/project.routes";
const app = express();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// DB connection
// connection();

app.get<{}, MessageResponse>("/", (req, res) => {
	res.json({
		message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
	});
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
