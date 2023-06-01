import Quiz from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

type InputObject = { [key: string]: any };

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const quizId = req.query.quizId;

  const token = req?.headers?.authorization?.split(" ")[1];

  const decodedToken = await verifyToken(token || "");

  const userId = (decodedToken as IUserToken).id;

  await connectToDatabase();

  let existingUser;
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
      error: "You're not authorized to update a quiz.",
    });
  }

  let existingQuiz;

  try {
    existingQuiz = await Quiz.findById(quizId);
  } catch (err) {
    return res.status(500).json({
      error: {
        message: err,
      },
    });
  }

  if (!existingQuiz) {
    return res.status(401).json({
      error: `The quiz with the id: ${quizId} doesn't exist.`,
    });
  }

  if (req.method === "POST") {
    const newResponse = new Response({
      quiz_id: existingQuiz._id as string,
      answers: req.body.answers,
      respondent_id: userId,
    });

    const savedResponse = await newResponse.save();

    return res.status(201).json({
      data: {
        response_id: savedResponse?.id,
      },
    });
  }
}

export default handler;
