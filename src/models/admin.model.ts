import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema({
	id: {
		type: Number,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	channel_id: {	
		type: mongoose.Schema.Types.ObjectId,
		ref: "Channel",
	},
});

export default AdminSchema;
