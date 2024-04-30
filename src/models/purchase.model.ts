import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
});

PurchaseSchema.pre('validate', function (next) {
  if ((this.channel && this.group) || (!this.channel && !this.group)) {
    next(new Error('A purchase must have either a channel or a group, but not both'));
  }
  next();
});

export default PurchaseSchema;