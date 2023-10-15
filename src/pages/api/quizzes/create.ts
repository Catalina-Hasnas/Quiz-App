import Quiz from "@/models/quiz";
import User from "@/models/user";
import { connectToDatabase } from "@/services/database.service";
import { ICreateQuizResponse } from "@/services/quiz/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICreateQuizResponse>
) {
  if (req.method !== "POST") {
    return;
  }

  const { title, description } = req.body;

  const tokenServer = await getToken({
    req,
    secret: process.env.ACCESS_TOKEN_SECRET,
  });
  if (!tokenServer?.user) {
    return res.status(401);
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({
      email: tokenServer?.user?.email ?? "",
    });
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't find user: " + err,
      },
    });
  }

  if (!existingUser) {
    return res.status(401).json({
      data: null,
      error: {
        message: "You're not authorized to create a quiz.",
      },
    });
  }

  const newQuiz = new Quiz({
    title,
    description,
    creator_id: existingUser._id,
    questions: [],
    status: "draft",
  });

  let createdQuiz;

  try {
    createdQuiz = await newQuiz.save();
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't create quiz",
      },
    });
  }

  if (createdQuiz) {
    return res.status(201).json({
      data: {
        quiz_id: createdQuiz.id,
      },
      error: null,
    });
  }
}

export default handler;
