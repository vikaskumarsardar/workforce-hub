export interface IUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface IUserWithHash extends IUser {
  passwordHash: string;
}
