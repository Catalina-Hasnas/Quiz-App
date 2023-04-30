import Quiz from "@/models/quiz";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const quizId = req.query.id;

  const filter = req.query.filter;

  if (filter) {
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

  if (quizId) {
    if (req.method === "GET") {
      Quiz.findById(quizId)
        .then((quiz) => {
          if (!quiz) {
            return res.status(404).json({
              error: {
                message: `Couldn't find quiz with ID ${quizId}`,
              },
            });
          }

          return res.status(200).json({
            data: {
              quiz: quiz,
            },
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: {
              message: `Couldn't find quiz with ID ${quizId}: ${err}`,
            },
          });
        });
    }
  }
}

export default handler;
