import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
	id: {
		type: Number, // format md5(userid+meowm30w)
		required: true,
	},
	adminChatId: {
		type: String,
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
	projects: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
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
