import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
	id: {
		type: Number,
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

export default GroupSchema;
