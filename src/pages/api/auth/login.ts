import User, { UserModel } from "@/models/user";
import { verifyPassword, getToken } from "@/services/auth/auth";
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

  const { email, password }: Omit<UserModel, "name"> = req.body;

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't log you in." + err,
      },
    });
  }

  if (!existingUser) {
    return res.status(404).json({
      data: null,
      error: {
        message: "Couldn't find a user with such an email.",
      },
    });
  }

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

  let isValidPassword = false;

  try {
    isValidPassword = await verifyPassword(
      password,
      existingUser?.password || ""
    );
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't log you in." + err,
      },
    });
  }

  if (!isValidPassword) {
    return res.status(401).json({
      data: null,
      error: {
        message:
          "The password you entered is incorrect. Please check your credentials and try again.",
      },
    });
  }

  let token;

  if (existingUser) {
    try {
      token = await getToken(existingUser.id.toString(), existingUser.email);
    } catch (err) {
      return res.status(500).json({
        data: null,
        error: {
          message: "Couldn't log you in." + err,
        },
      });
    }
  }

  return res.status(200).json({
    data: {
      id: existingUser.id.toString(),
      email: existingUser.email,
      name: existingUser.name,
      token: `Bearer ${token}`,
    },
    error: null,
  });
}

export default handler;
