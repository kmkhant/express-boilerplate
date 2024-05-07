export interface IUserInfo {
	chatId: number;
	id: number;
	name: string;
	username: string;
}

export interface IAuth extends Request {
	userInfo: IUserInfo;
}

export interface IAuthBot extends Request {
	botSecret: string;
}
