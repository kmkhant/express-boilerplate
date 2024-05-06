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
		required: false,
	},
	members: [
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
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const ChannelModel = mongoose.model(
	"Channel",
	ChannelSchema
);

export default ChannelModel;
