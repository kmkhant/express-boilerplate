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
		required: true,
	},
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	bot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Bot",
	},
});

const GroupModel = mongoose.model("Group", GroupSchema);

export default GroupModel;
