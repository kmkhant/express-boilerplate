import mongoose from "mongoose";

const BotSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project",
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	webhookURL: {
		type: String,
		required: true,
	},
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
		required: true,
	},
});

const BotModel = mongoose.model("Bot", BotSchema);

export default BotModel;
