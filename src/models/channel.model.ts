import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
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
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	showMembers: {
		type: Boolean,
    default: false,
		required: false,
	},
});

export default ChannelSchema;
