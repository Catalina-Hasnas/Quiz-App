import { UserModel } from "@/models/user";
import { JwtPayload } from "jsonwebtoken";

export interface IUserToken extends JwtPayload {
  id: string;
  email: string;
}

interface IAuthSuccessful extends Omit<UserModel, "password" | "name"> {
  id: string;
  token: string;
}

type HttpError = { message: string };

export interface IAuthResponse {
  error: HttpError | null;
  data: IAuthSuccessful | null;
}
