import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGODB_URI || "";

const connection = async () => {
	try {
		await mongoose.connect(connectionString, {
			autoIndex: true,
		});
		console.log("Connected to Atlas");
	} catch (error) {
		console.log(error);
	}
};

export default connection;
