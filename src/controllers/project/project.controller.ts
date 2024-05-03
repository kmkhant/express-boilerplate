import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import ProjectModel from "@/models/project.model";
import AdminModel from "@/models/admin.model";
import ChannelModel from "@/models/channel.model";

// import types
import { IAuth } from "@/types/";

export const getProjectsByAdmin = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	try {
		const currentAdmin = await AdminModel.findOne({
			id: userInfo.id,
		});

		if (!currentAdmin) {
			return res
				.status(404)
				.json({ message: "Admin not found" });
		}

		const projects = await ProjectModel.find({
			admin: currentAdmin._id,
		});

		return res.status(200).json(projects);
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Internal Server Error " });
	}
};

export const createProject = async (
	req: JWTRequest,
	res: Response
) => {
	try {
		const { userInfo } = req.auth as IAuth;

		const {
			name,
			description,
		}: {
			name: string;
			description: string;
		} = req.body;

		if (!userInfo) {
			return res
				.status(401)
				.json({ message: "Unauthorized" });
		}

		if (!name) {
			return res
				.status(400)
				.json({ message: "Invalid Request" });
		}

		const adminId = userInfo.id;

		// TODO - check if admin id is a valid telegram id if not create him as an admin
		const currentAdmin = await AdminModel.findOne({
			where: { id: adminId },
		});

		if (!currentAdmin) {
			const newAdmin = await AdminModel.create({
				id: adminId,
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
			await ProjectModel.create({
				name,
				description,
				admin: currentAdmin,
			});
			return res.status(200).json({ message: "OK" });
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
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const { projectId } = req.params;

	const { name, description } = req.body;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	if (name || description) {
		// check current user is admin of	 the project
		const adminId = userInfo.id;

		let project = await ProjectModel.findOne({
			_id: projectId,
		}).populate("admin");

		if (!project) {
			return res
				.status(404)
				.json({ message: "Project not found" });
		}

		if (project.admin instanceof AdminModel) {
			// check if the user is the admin of the project
			if (project.admin.id !== adminId) {
				return res
					.status(403)
					.json({ message: "Forbidden" });
			}

			// update the project
			await ProjectModel.findOneAndUpdate(
				{ _id: projectId },
				{ name, description }
			);
		}
		return res.status(200).json({ message: "OK" });
	} else {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}
};

// add channel to project
export const addChannelToProject = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const { projectId } = req.params;
	const { channelId, channelName, channelDescription } =
		req.body;

	const adminId = userInfo.id;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	if (!channelId || !projectId || !channelName) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: projectId,
	}).populate("admin");

	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentProject.admin.id !== adminId
	) {
		return res.status(403).json({ message: "Forbidden" });
	}

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	const currentChannel = await ChannelModel.findOne({
		id: channelId,
	});

	if (currentChannel && currentChannel._id) {
		// check if channel already exists in the project
		const channelExists = currentProject.channels.some(
			(channel) => channel.equals(currentChannel._id)
		);

		console.log(channelExists);

		if (channelExists)
			return res
				.status(400)
				.json({ message: "Channel already exists." });
	}

	if (!currentChannel) {
		const newChannel = await ChannelModel.create({
			id: channelId,
			name: channelName,
			description: channelDescription,
		});

		await ProjectModel.findOneAndUpdate(
			{
				_id: projectId,
			},
			{
				$push: { channels: newChannel },
			}
		);

		return res.status(200).json({ message: "OK" });
	}

	return res
		.status(500)
		.json({ message: "Internal Server Error" });
};

export const deleteChannelFromProject = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const { projectId, channelId } = req.params; // project id

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	if (!channelId || !projectId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const adminId = userInfo.id;

	const currentAdmin = await AdminModel.findOne({
		id: adminId,
	});

	if (!currentAdmin) {
		return res.status(403).json({ message: "Forbidden" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: projectId,
	}).populate("admin");

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	// check if the user is the admin of the project
	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentAdmin.id !== adminId
	) {
		return res.status(403).json({ message: "Forbidden" });
	}

	const currentChannel = await ChannelModel.findOne({
		id: channelId,
	});

	if (!currentChannel) {
		return res
			.status(404)
			.json({ message: "Channel not found" });
	}

	// check if channel exists in the project
	const channelExists = currentProject.channels.some(
		(channel) => channel.equals(currentChannel._id)
	);

	if (channelExists) {
		await ProjectModel.findOneAndUpdate(
			{
				_id: projectId,
			},
			{
				$pull: { channels: currentChannel._id },
			}
		);

		await ChannelModel.findOneAndDelete({
			id: channelId,
		});

		return res
			.status(200)
			.json({ message: "deleted channel" });
	} else {
		return res
			.status(404)
			.json({ message: "Channel is not in the project" });
	}
};

// delete project
export const deleteProject = async (
	req: JWTRequest,
	res: Response
) => {
	const { userInfo } = req.auth as IAuth;

	const projectId = req.params.projectId;

	if (!projectId || !userInfo) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const adminId = userInfo.id;

	const currentAdmin = await AdminModel.findOne({
		id: adminId,
	});

	if (!currentAdmin) {
		return res.status(403).json({ message: "Forbidden" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: projectId,
	}).populate("admin");

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentAdmin.id !== adminId
	) {
		return res.status(403).json({ message: "Forbidden" });
	} else {
		// delete channels in the project
		for (
			let i = 0;
			i < currentProject.channels.length;
			i++
		) {
			await ChannelModel.findOneAndDelete({
				_id: currentProject.channels[i],
			});
		}

		// delete groups in the project
		// TODO - delete groups

		// finally delete the project
		await ProjectModel.findOneAndDelete({
			_id: projectId,
		});
		return res
			.status(200)
			.json({ message: "OK, deleted the project" });
	}
};

export const transferProject = async (
	req: JWTRequest,
	res: Response
) => {
	const { projectId } = req.params;
	const { userInfo } = req.auth as IAuth;

	// TODO - find if new admin is valid telegram user
	const { newAdminId }: { newAdminId: string } = req.body;

	if (!projectId || !newAdminId) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: projectId,
	}).populate("admin");

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	// console.log(currentProject);
	// console.log(secureHash(userInfo.id));

	// check if the curent user is the admin of the project
	if (
		currentProject.admin instanceof AdminModel &&
		currentProject.admin.id !== userInfo.id
	) {
		return res
			.status(403)
			.json({ message: "You don't own this project." });
	}

	// check if the new admin is the current admin of the project
	if (
		currentProject.admin instanceof AdminModel &&
		currentProject.admin.id === newAdminId
	) {
		return res.status(500).json({
			message:
				"New admin is the same person as current admin of the project",
		});
	}

	const newAdmin = await AdminModel.findOne({
		id: newAdminId,
	});

	// if admin is not registered in database, create a new admin
	// extract data using username @username
	if (!newAdmin) {
		// extract userinfo from user id provided
		// TODO - implement this function
		const newAdminModel = await AdminModel.create({
			id: newAdminId,
		});

		await ProjectModel.findOneAndUpdate(
			{ id: projectId },
			{ admin: newAdminModel }
		);

		return res.status(200).json({
			message:
				"newAdmin has been created. this project has been transferred to the new admin",
		});
	} else {
		await ProjectModel.findOneAndUpdate(
			{ _id: projectId },
			{ admin: newAdmin }
		);

		return res.status(200).json({
			message:
				"this project has been transferred to the new admin",
		});
	}
};
