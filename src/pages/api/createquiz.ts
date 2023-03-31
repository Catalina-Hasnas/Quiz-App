import { Quiz } from "@/models/quiz";
import { QuizModel } from "@/models/types";
import { User } from "@/models/user";
import { verifyToken } from "@/services/auth";
import { IUserToken, UserDocument } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  if (req.method !== "POST") {
    return;
  }

  const { title, questions, creator_id }: QuizModel = req.body;

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
        message: err,
      },
    });
  }

  if (!existingUser) {
    return res.status(401).json({
      error: "You're not authorized to create a quiz.",
    });
  }

  const newQuiz = new Quiz({
    title,
    questions,
    creator_id,
  });

  try {
    await newQuiz.save();
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: {
        message: "Couldn't create quiz",
      },
    });
  }

  return res.status(201).json({
    message: "Quiz created successfuly.",
  });
}

export default handler;
