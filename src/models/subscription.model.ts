import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
	chatId: {
		type: Number,
		required: true,
	},
	plan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Plan",
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
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
});

SubscriptionSchema.pre("validate", function (next) {
	if (
		(this.channel && this.group) ||
		(!this.channel && !this.group)
	) {
		next(
			new Error(
				"A subscription must have either a channel or a group, but not both"
			)
		);
	}
	next();
});

const SubscriptionModel = mongoose.model(
	"Subscription",
	SubscriptionSchema
);

export default SubscriptionModel;
