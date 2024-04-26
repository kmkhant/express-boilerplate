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
});

export default ChannelSchema;
