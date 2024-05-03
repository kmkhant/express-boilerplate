/* eslint-disable @typescript-eslint/naming-convention */
import PlanModel from "@/models/plan.model";
import { Request, Response } from "express";

interface IAddPlan {
	name: string;
	description?: string;
	price_per_week?: number;
	price_per_two_weeks?: number;
	price_per_month?: number;
	price_per_two_months?: number;
	price_per_three_months?: number;
	price_per_six_months?: number;
	price_per_year?: number;
	lifetime?: number;
	availableChannels?: string[];
	availableGroups?: string[];
}

export const addPlan = async (
	req: Request,
	res: Response
) => {
	try {
		const {
			name,
			description,
			price_per_week,
			price_per_two_weeks,
			price_per_month,
			price_per_two_months,
			price_per_three_months,
			price_per_six_months,
			price_per_year,
			lifetime,
			availableChannels,
			availableGroups,
		}: IAddPlan = req.body;

		if (
			!name ||
			(availableChannels && !availableChannels.length) ||
			(availableGroups && !availableGroups.length)
		) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		if (
			!price_per_week ||
			!price_per_two_weeks ||
			!price_per_month ||
			!price_per_two_months ||
			!price_per_three_months ||
			!price_per_six_months ||
			!price_per_year ||
			!lifetime
		) {
			return res
				.status(400)
				.json({ message: "Include a plan price" });
		}

		if (!availableChannels || !availableGroups) {
			return res.status(400).json({
				message: "Include available channels or groups",
			});
		}

		// add channels to the plan
		// TODO

		const plan = await PlanModel.create({
			name,
			description,
			price_per_week,
			price_per_two_weeks,
			price_per_month,
			price_per_two_months,
			price_per_three_months,
			price_per_six_months,
			price_per_year,
			lifetime,
		});

		return res.status(200).json(plan);
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};
