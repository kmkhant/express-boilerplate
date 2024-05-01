import { Request, Response } from "express";
import ProjectModel from "@/models/project.model";
import AdminModel from "@/models/admin.model";
import { secureHash } from "@/utils/secureHash";

export const getProjectsByAdmin = async (
	req: Request,
	res: Response
) => {
	try {
		const projects = await ProjectModel.find();

		return res.status(200).json(projects);
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Internal Server Error " });
	}
};

export const createProject = async (
	req: Request,
	res: Response
) => {
	try {
		const { name, description, userInfo } = req.body;

		if (!name || !description || !userInfo) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		const secureId = secureHash(userInfo.id);

		// TODO - check if admin id is a valid telegram id if not create him as an admin
		const currentAdmin = await AdminModel.findOne({
			where: { id: secureId },
		});

		if (!currentAdmin) {
			const newAdmin = await AdminModel.create({
				id: secureId,
				name: userInfo.name,
				username: userInfo.username,
			});
			const project = await ProjectModel.create({
				name,
				description,
				admin: newAdmin,
			});
			return res.status(200).json(project);
		} else {
			const project = await ProjectModel.create({
				name,
				description,
				admin: currentAdmin,
			});
			return res.status(200).json(project);
		}
	} catch (error) {
		console.log(error);

		return res
			.status(500)
			.json({ message: "Internal Server Error" });
	}
};

// TODO - Implement updateProject function, still not finished
export const updateProject = async (
	req: Request,
	res: Response
) => {
	const { id } = req.params;
	const { name, description, userInfo } = req.body;

	if (!name || !description) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	// check current user is admin of	 the project
	const adminId = secureHash(userInfo.id);

	let project = await ProjectModel.findOne({
		_id: id,
	}).populate("admin");

	if (!project) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	if (project.admin instanceof AdminModel) {
		// check if the user is the admin of the project
		if (project.admin.id !== adminId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		// update the project
		await ProjectModel.findOneAndUpdate(
			{ _id: id },
			{ name, description }
		);
	}

	return res.status(200).json({ message: "OK" });
};
