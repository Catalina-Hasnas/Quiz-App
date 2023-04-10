import Question, { QuestionModelWithId } from "@/models/question";
import Quiz from "@/models/quiz";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const quizId = req.query.params?.[0];

  const questionId = req.query.params?.[2];

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

  if (!questionId) {
    const newQuestion = new Question({
      title: "",
      type: "open",
      options: [],
    });

    await existingQuiz.questions.push(newQuestion);

    const updatedQuiz = await existingQuiz.save();

    return res.status(201).json({
      message: "New question added!",
      question_id: updatedQuiz?.questions?.at(-1)?.id,
    });
  }

  if (quizId && questionId) {
    if (req.method === "GET") {
      Quiz.findOne(
        { _id: quizId, "questions._id": questionId },
        { "questions.$": 1 }
      )
        .then((quiz) => {
          if (!quiz) {
            return res.status(404).json({
              error: {
                message: `Question with ID ${questionId} not found in Quiz with ID ${quizId}`,
              },
            });
          }
          const question = quiz.questions[0];
          return res.status(200).json({
            data: question,
          });
        })
        .catch((err) => {
          return res.status(404).json({
            error: {
              message: `Couldn't find Question with ID ${questionId} in Quiz with ID ${quizId}: ${err}`,
            },
          });
        });
    }
  }
  type InputObject = { [key: string]: any };

  function formatObject(obj: InputObject): { [key: string]: any } {
    const formattedObj: { [key: string]: any } = {};
    for (const key in obj) {
      formattedObj[`questions.$.${key}`] = obj[key];
    }
    return formattedObj;
  }

  if (req.method === "PATCH") {
    Quiz.findOneAndUpdate(
      { _id: quizId, "questions._id": questionId },
      { $set: formatObject(req.body) },
      { new: true }
    )
      .then((quiz) => {
        if (!quiz) {
          return res.status(404).json({
            error: {
              message: `Question with ID ${questionId} not found in Quiz with ID ${quizId}`,
            },
          });
        }
        const question = quiz.questions.find(
          (question: QuestionModelWithId) =>
            question._id.toString() === questionId
        );
        return res.status(201).json({
          data: question,
        });
      })
      .catch((err) => {
        return res.status(404).json({
          error: {
            message: `Couldn't update question with ID ${questionId} in Quiz with ID ${quizId}: ${err}`,
          },
        });
      });
  }
}

export default handler;
