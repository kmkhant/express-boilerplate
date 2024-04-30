import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
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
    }],
	accepted_payments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
		},
	],
});

export default AdminSchema;
