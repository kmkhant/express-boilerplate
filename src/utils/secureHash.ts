import md5 from "md5";

export const secureHash = (input: string): string => {
	return md5(input + "meowm30wKim5091");
};
