/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";

enum PLAN_DURATION {
	WEEK = "week",
	TWO_WEEKS = "two_weeks",
	MONTH = "month",
	TWO_MONTH = "two_months",
	THREE_MONTH = "three_months",
	SIX_MONTH = "six_months",
	YEAR = "year",
	LIFETIME = "lifetime",
}

const PlanSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	plan_duration: {
		type: String,
		enum: Object.values(PLAN_DURATION),
		required: true,
	},
	price: {
		type: Number,
		required: true,
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
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
	},
});

const PlanModel = mongoose.model("Plan", PlanSchema);

export default PlanModel;
