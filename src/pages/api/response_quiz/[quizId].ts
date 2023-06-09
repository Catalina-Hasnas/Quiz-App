import { QuestionModelWithId } from "@/models/question";
import Quiz from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

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
      reviewed: !req.body.answers.some(
        (answer: QuestionModelWithId) => answer.type === "open"
      ),
    });

    const savedResponse = await newResponse.save();

    return res.status(201).json({
      data: {
        response_id: savedResponse?.id,
      },
    });
  }

  if (req.method === "GET") {
    const quizObjectId = new mongoose.Types.ObjectId(quizId as string);
    const responses = await Response.aggregate([
      {
        $match: { quiz_id: quizObjectId },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "respondent_id",
          foreignField: "_id",
          as: "respondent",
        },
      },
      {
        $project: {
          _id: 1,
          reviewed: 1,
          quiz_id: 1,
          respondent: { $arrayElemAt: ["$respondent.name", 0] },
        },
      },
    ]);

    if (responses) {
      return res.status(200).json({
        data: {
          responses: responses,
        },
      });
    }

    return res.status(200).json({
      data: {
        responses: [],
      },
    });
  }
}

export default handler;
