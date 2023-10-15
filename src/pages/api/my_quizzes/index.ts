import Quiz from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { connectToDatabase } from "@/services/database.service";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const tokenServer = await getToken({
    req,
    secret: process.env.ACCESS_TOKEN_SECRET,
  });
  console.log("tokenServer");
  console.log(tokenServer);

  if (!tokenServer?.user) {
    return res.status(401).json({
      error: "You're not authorized.",
    });
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({
      email: tokenServer?.user?.email ?? "",
    });
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
    { creator_id: existingUser._id },
    "_id title status"
  ).sort({
    _id: -1,
  });

  const responses = await Response.aggregate([
    {
      $match: { respondent_id: existingUser._id },
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
        message: `Couldn't find Responses of user with id ${existingUser._id}`,
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
