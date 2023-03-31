import { User } from "@/models/user";
import { verifyPassword, getToken } from "@/services/auth";
import { connectToDatabase } from "@/services/database.service";
import { IAuthResponse, UserDocument } from "@/services/auth/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserModel } from "@/models/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IAuthResponse>
) {
  if (req.method !== "POST") {
    return;
  }

  const { email, password }: UserModel = req.body;

  await connectToDatabase();

  let existingUser: UserDocument | null = null;
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
      token: `Bearer ${token}`,
    },
    error: null,
  });
}

export default handler;
