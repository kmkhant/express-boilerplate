export interface IUserInfo {
	id: string;
	name: string;
	username: string;
}

export interface IAuth extends Request {
	userInfo: IUserInfo;
}
