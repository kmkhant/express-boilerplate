import mongoose from "mongoose";

const BotSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
	},
});

const BotModel = mongoose.model("Bot", BotSchema);

export default BotModel;
