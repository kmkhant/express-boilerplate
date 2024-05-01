import mongoose from "mongoose";

const RevenueSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  averageDailyIncome: {
    type: Number,
    default: 0,
    required: true,
  },
  currentMonthIncome: {
    type: Number,
    default: 0,
    required: true,
  },
  currentYearIncome: {
    type: Number,
    default: 0,
    required: true,
  },
  totalIncome: {
    type: Number,
    default: 0,
    required: true,
  },
});

const RevenueModel = mongoose.model("Revenue", RevenueSchema);

export default RevenueModel;