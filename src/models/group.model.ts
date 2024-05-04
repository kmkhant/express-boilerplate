import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project",
	},
	bot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Bot",
	},
});

const GroupModel = mongoose.model("Group", GroupSchema);

export default GroupModel;
