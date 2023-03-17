import { User } from "@/models/user";
import {
  generateToken,
  hashPassword,
  verifyPassword,
  getToken,
} from "@/services/auth";
import { connectToDatabase } from "@/services/database.service";
import { IUser } from "@/services/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const data: IUser = req.body;

  const { email, password } = data;

  await connectToDatabase();

  let existingUser: IUser | null = null;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (!existingUser) {
    res.status(401).json({
      message: "Coudln't find a user with such an email.",
    });
  }

  let isValidPassword = false;

  try {
    isValidPassword = await verifyPassword(
      password,
      existingUser?.password || ""
    );
  } catch (err) {
    res.status(401).json({
      message:
        "Couldn't log you in. Please check your credentials and try again.",
    });
  }

  if (!isValidPassword) {
    res.status(401).json({
      message:
        "Couldn't log you in. Please check your credentials and try again.",
    });
  }

  let token;
  try {
    token = await getToken(existingUser?._id || "", existingUser?.email || "");
  } catch (err) {
    res.status(500).json({
      message: "Loging in failed, please try again later.",
    });
  }

  res.json({
    id: existingUser?._id,
    email: existingUser?.email,
    token: `Bearer ${token}`,
  });
}

export default handler;
