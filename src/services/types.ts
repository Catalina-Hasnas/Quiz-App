import { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  email: string;
  password: string;
}

export interface IUserToken extends JwtPayload {
  id: string;
  email: string;
}
