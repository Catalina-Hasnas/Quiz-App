import { Schema, model, models } from "mongoose";

export interface UserModel {
  email: string;
  password: string;
  name: string;
}

const userSchema = new Schema<UserModel>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
});

// @ts-ignore
const User = models.User<UserModel> || model("User", userSchema);

export default User;
