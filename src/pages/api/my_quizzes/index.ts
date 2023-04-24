import Quiz from "@/models/quiz";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
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

  Quiz.find({ creator_id: userId }, "_id title")
    .then((quizzes) => {
      return res.status(200).json({
        data: {
          quizzes: quizzes,
        },
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: {
          message: `Couldn't find Quizzes of user with id ${userId}: ${err}`,
        },
      });
    });
}

export default handler;
