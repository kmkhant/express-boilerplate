import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
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

const ChannelModel = mongoose.model("Channel", ChannelSchema);

export default ChannelModel;
