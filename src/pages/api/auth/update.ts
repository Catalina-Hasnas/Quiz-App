import { User } from "@/models/user";
import { hashPassword, verifyToken } from "@/services/auth/auth";
import { connectToDatabase } from "@/services/database.service";
import { IUserToken, UserDocument } from "@/services/auth/types";
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

  await connectToDatabase();

  let existingUser: UserDocument | null = null;
  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    return res.status(500).json({
      error: {
        message: "Couldn't update your password." + err,
      },
    });
  }

  if (!existingUser) {
    return res.status(404).json({
      error:
        "Couldn't find the user you're trying to change the password too. Please make sure you're logged in and try again.",
    });
  }

  try {
    existingUser.password = await hashPassword(newPassword);
    await existingUser.save();
  } catch (err) {
    return res.status(500).json({
      error: {
        message: "Couldn't update your password." + err,
      },
    });
  }
  return res.status(200).json({
    message: "Password changed successfully",
  });
}

export default handler;
