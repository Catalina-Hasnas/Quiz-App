import Quiz from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { connectToDatabase } from "@/services/database.service";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const quizId = req.query.quizId;
  
  const tokenServer = await getToken({
    req,
    secret: process.env.ACCESS_TOKEN_SECRET,
  });
  if(!tokenServer?.user) {
    return res.status(401);
  }

  await connectToDatabase();

  let existingUser;
  try {
    existingUser = await User.findOne({ email: tokenServer?.user?.email ?? "" });
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
      respondent_id: existingUser._id,
      reviewed: false,
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
