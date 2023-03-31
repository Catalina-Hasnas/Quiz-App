import { UserModel } from "@/models/types";
import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

export interface IUserToken extends JwtPayload {
  id: string;
  email: string;
}

interface IAuthSuccessful extends Omit<UserModel, "password"> {
  id: string;
  token: string;
}

type HttpError = { message: string };

export interface IAuthResponse {
  error: HttpError | null;
  data: IAuthSuccessful | null;
}

export type UserDocument = Document & UserModel;
