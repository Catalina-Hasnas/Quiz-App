import User, { UserModel } from "@/models/user";
import { getToken, hashPassword } from "@/services/auth/auth";
import { connectToDatabase } from "@/services/database.service";
import { IAuthResponse } from "@/services/auth/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IAuthResponse>
) {
  if (req.method !== "POST") {
    return;
  }

  const { email, password }: UserModel = req.body;

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 6
  ) {
    return res.status(422).json({
      data: null,
      error: {
        message:
          "Invalid input. Password should also be at least 7 characters long. Email should contain @.",
      },
    });
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't sign you up." + err,
      },
    });
  }

  if (existingUser) {
    return res
      .status(409)
      .json({ data: null, error: { message: "User exists already!" } });
  }

  const hashedPassword = await hashPassword(password);

  const createdUser = new User({
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't sign you up." + err,
      },
    });
  }

  let token;
  try {
    token = await getToken(createdUser.id, createdUser.email);
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couln't log in. Unable to generate token.",
      },
    });
  }

  return res.status(201).json({
    data: {
      id: createdUser.id,
      email: createdUser.email,
      token: `Bearer ${token}`,
    },
    error: null,
  });
}

export default handler;
