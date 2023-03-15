import { User } from "@/models/user";
import { hashPassword } from "@/services/auth";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;

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
  res.status(201).json({ message: "Created user!" });
}

export default handler;
