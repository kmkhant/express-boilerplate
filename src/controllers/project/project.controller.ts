import { Request, Response } from "express";
import ProjectModel from "@/models/project.model";
import AdminModel from "@/models/admin.model";
import { secureHash } from "@/utils/secureHash";
import ChannelModel from "@/models/channel.model";

// import types
import { IUserInfo } from "@/types/";

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
		const {
			name,
			description,
			userInfo,
		}: {
			name: string;
			description: string;
			userInfo: IUserInfo;
		} = req.body;

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

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

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

// add channel to project
export const addChannelToProject = async (
	req: Request,
	res: Response
) => {
	const { id } = req.params;
	const {
		channelId,
		channelName,
		channelDescription,
		userInfo,
	} = req.body;

	if (!userInfo) {
		return res
			.status(401)
			.json({ message: "Unauthorized" });
	}

	if (!channelId || !id || !channelName) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const currentProject = await ProjectModel.findOne({
		_id: id,
	}).populate("admin");

	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentProject.admin.id !== secureHash(userInfo.id)
	) {
		return res.status(403).json({ message: "Forbidden" });
	}

	if (!currentProject) {
		return res
			.status(404)
			.json({ message: "Project not found" });
	}

	const secureChannelId = secureHash(channelId);

	const currentChannel = await ChannelModel.findOne({
		id: secureChannelId,
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
			id: secureChannelId,
			name: channelName,
			description: channelDescription,
		});

		await ProjectModel.findOneAndUpdate(
			{
				_id: id,
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
	req: Request,
	res: Response
) => {
	const { projectId, channelId } = req.params; // project id
	const { userInfo } = req.body;

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

	const currentAdmin = await AdminModel.findOne({
		id: secureHash(userInfo.id),
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

	const secureAdminId = secureHash(userInfo.id);
	const secureChannelId = channelId;

	// check if the user is the admin of the project
	if (
		currentProject &&
		currentProject.admin instanceof AdminModel &&
		currentAdmin.id !== secureAdminId
	) {
		return res.status(403).json({ message: "Forbidden" });
	}

	const currentChannel = await ChannelModel.findOne({
		id: secureChannelId,
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
			id: secureChannelId,
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
	req: Request,
	res: Response
) => {
	const projectId = req.params.projectId;

	const { userInfo }: { userInfo: IUserInfo } = req.body;

	if (!projectId || !userInfo) {
		return res
			.status(400)
			.json({ message: "Invalid Request" });
	}

	const currentAdmin = await AdminModel.findOne({
		id: secureHash(userInfo.id),
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
		currentAdmin.id !== secureHash(userInfo.id)
	) {
		return res.status(403).json({ message: "Forbidden" });
	} else {
		// delete channels in the project including removing bot from the channels
		for (
			let i = 0;
			i < currentProject.channels.length;
			i++
		) {
			await ChannelModel.findOneAndDelete({
				_id: currentProject.channels[i],
			});
		}

		// delete groups in the project including removing bot from the groups
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
