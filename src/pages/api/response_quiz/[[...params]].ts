import Question, { QuestionModelWithId } from "@/models/question";
import Quiz, { QuizModel } from "@/models/quiz";
import Response, { ResponseModel } from "@/models/response";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

type InputObject = { [key: string]: any };

interface FormatObjectParams {
  obj: InputObject;
  editQuestion: Boolean;
}

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const quizId = req.query.params?.[0];

  const responseId = req.query.params?.[2];

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

  if (!responseId && req.method === "POST") {
    const newResponse = new Response({
      quiz_id: existingQuiz._id as string,
      answers: [{ ...req.body }],
      respondent_id: userId,
    });

    const savedResponse = await newResponse.save();

    return res.status(201).json({
      data: {
        response_id: savedResponse?.id,
      },
    });
  }

  if (responseId && req.method === "PATCH") {
    const existingResponse = await Response.findById(responseId);
    const existingAnswer = await Response.findOne({
      _id: responseId,
      "answers._id": req.body._id,
    });

    if (existingAnswer) {
      Response.findOneAndUpdate(
        { _id: responseId, "answers._id": req.body._id },
        { $set: { "answers.$.options": req.body.options } },
        { new: true }
      )
        .then((response) => {
          return res.status(200).json({
            data: {
              data: response,
            },
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: {
              message: err.toString(),
            },
          });
        });
    }

    if (!existingAnswer) {
      existingResponse.answers.push(req.body);

      const updatedResponse = await existingResponse.save();

      return res.status(201).json({
        data: {
          data: updatedResponse,
        },
      });
    }
  }
}

export default handler;
