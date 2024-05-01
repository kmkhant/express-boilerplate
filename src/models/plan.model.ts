import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	price_per_week: {
		type: Number,
	},
	price_per_two_weeks: {
		type: Number,
	},
	price_per_month: {
		type: Number,
	},
	price_per_two_months: {},
	price_per_three_months: {
		type: Number,
	},
	price_per_six_months: {
		type: Number,
	},
	price_per_year: {
		type: Number,
	},
	lifetime: {
		type: Number,
	},
});

const PlanModel = mongoose.model("Plan", PlanSchema);

export default PlanModel;
