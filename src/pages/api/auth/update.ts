import { User } from "@/models/user";
import {
  generateToken,
  hashPassword,
  verifyPassword,
  verifyToken,
} from "@/services/auth";
import { connectToDatabase } from "@/services/database.service";
import { IUser, IUserToken } from "@/services/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const {
    oldPassword,
    newPassword,
  }: { oldPassword: string; newPassword: string } = req.body;

  const token = req?.headers?.authorization?.split(" ")[1];

  const decodedToken = await verifyToken(token || "");

  const userId = (decodedToken as IUserToken).id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
