import { User } from "@/models/user";
import { getToken, hashPassword } from "@/services/auth";
import { connectToDatabase } from "@/services/database.service";
import { IUser } from "@/services/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const data: IUser = req.body;

  const { email, password } = data;

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 6
  ) {
    res.status(422).json({
      message:
        "Invalid input - password should also be at least 7 characters long.",
    });
    return;
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (existingUser) {
    res.status(422).json({ message: "User exists already!" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const createdUser = new User({
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
  }

  createdUser
    .save()
    .catch((err: string) =>
      res.status(400).json({ error: "Error on '/api/auth/signup': " + err })
    );

  let token: string = "";
  try {
    token = await getToken(createdUser._id, createdUser.email);
  } catch (err) {
    console.log(err);
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "Couldn't sign you up. Please try again." });
    return;
  }

  res.status(201).json({
    id: createdUser?._id,
    email: createdUser?.email,
    token: `Bearer ${token}`,
  });
}

export default handler;
