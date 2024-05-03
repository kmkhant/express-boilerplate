import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
	id: {
		type: String, // format md5(userid+meowm30w)
		required: true,
	},
	name: {
		type: String,
		required: false,
	},
	username: {
		type: String,
		required: false,
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
	accepted_payments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
		},
	],
});

const AdminModel = mongoose.model("Admin", AdminSchema);

export default AdminModel;
