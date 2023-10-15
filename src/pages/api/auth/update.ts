import User from "@/models/user";
import { hashPassword } from "@/services/auth/auth";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const {
    oldPassword,
    newPassword,
  }: { oldPassword: string; newPassword: string } = req.body;

  const tokenServer = await getToken({
    req,
    secret: process.env.ACCESS_TOKEN_SECRET,
  });
  if(!tokenServer?.user) {
    return res.status(401);
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: tokenServer?.user?.email ?? "" });
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
