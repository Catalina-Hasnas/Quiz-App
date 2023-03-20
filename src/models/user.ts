import { IUserModel } from "@/services/types";
import { Schema, model, models } from "mongoose";

const userSchema = new Schema<IUserModel>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

export const User = models.User<IUserModel> || model("User", userSchema);
