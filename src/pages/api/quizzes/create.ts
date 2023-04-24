import Quiz from "@/models/quiz";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import { ICreateQuizResponse } from "@/services/quiz/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICreateQuizResponse>
) {
  if (req.method !== "POST") {
    return;
  }

  const { title, description } = req.body;

  const token = req?.headers?.authorization?.split(" ")[1];

  const decodedToken = await verifyToken(token || "");

  const userId = (decodedToken as IUserToken).id;

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findById(userId);
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
    creator_id: userId,
    questions: [],
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
