import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

export interface IUserModel {
  email: string;
  password: string;
}

export interface IUserToken extends JwtPayload {
  id: string;
  email: string;
}

export interface IAuthSuccessful extends Omit<IUserModel, "password"> {
  id: string;
  token: string;
}

export type HttpError = { message: string };

export interface IAuthResponse {
  error: HttpError | null;
  data: IAuthSuccessful | null;
}

export type UserDocument = Document & IUserModel;
