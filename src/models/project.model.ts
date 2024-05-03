import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
		required: true,
	},
	channels: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Channel",
		},
	],
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
		},
	],
	bot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Bot",
	},
	paymentOption: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
		},
	],
});

const Project = mongoose.model("Project", ProjectSchema);

export default Project;
