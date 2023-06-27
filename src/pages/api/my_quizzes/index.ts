import Quiz from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
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

  if (req.method !== "GET") {
    return;
  }

  const quizzes = await Quiz.find(
    { creator_id: userId },
    "_id title status"
  ).sort({
    _id: -1,
  });

  const userObjectId = new mongoose.Types.ObjectId(userId as string);

  const responses = await Response.aggregate([
    {
      $match: { respondent_id: userObjectId },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz_id",
        foreignField: "_id",
        as: "quiz",
      },
    },
    {
      $project: {
        _id: 1,
        reviewed: 1,
        quiz_id: 1,
        quiz_title: { $arrayElemAt: ["$quiz.title", 0] },
      },
    },
  ]);

  if (!responses) {
    return res.status(404).json({
      error: {
        message: `Couldn't find Responses of user with id ${userId}`,
      },
    });
  }

  return res.status(200).json({
    data: {
      quizzes: quizzes,
      responses: responses,
    },
  });
}

export default handler;
