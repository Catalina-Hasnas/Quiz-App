import { Schema, model, models } from "mongoose";
import { UserModel } from "./types";

const userSchema = new Schema<UserModel>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

export const User = models.User<UserModel> || model("User", userSchema);
