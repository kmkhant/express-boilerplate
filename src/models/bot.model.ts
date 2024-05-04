import mongoose from "mongoose";

const BotSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	token: {
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
