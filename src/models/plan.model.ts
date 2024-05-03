import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
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
	channels: [
		{
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Channel",
		},
	],
	groups: [
		{
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Group",
		},
	],
});

const PlanModel = mongoose.model("Plan", PlanSchema);

export default PlanModel;
