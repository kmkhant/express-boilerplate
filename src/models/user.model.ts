import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	id: {
		// format md5(userid+meowm30w)
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	subscriptions: [
		{
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Subscription",
				},
			],
			required: false,
		},
	],
	groups: [
		{
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Group",
				},
			],
			required: false,
		},
	],
	channels: [
		{
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Channel",
				},
			],
			required: false,
		},
	],
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
