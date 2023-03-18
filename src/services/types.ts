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

export interface ILoginResponse {
  id: string;
  email: string;
  token: string;
}

export type HttpError = { message: string };
