import Question, { QuestionModelWithId } from "@/models/question";
import Quiz, { QuizModel } from "@/models/quiz";
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

const formatObject = ({ obj, editQuestion }: FormatObjectParams) => {
  const formattedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (editQuestion) {
      formattedObj[`questions.$.${key}`] = obj[key];
      return formattedObj;
    }
    formattedObj[key] = obj[key];
  }
  return formattedObj;
};

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

  if (req.method === "POST") {
    const { title, type, options } = req.body;

    const newQuestion = new Question({
      title,
      type,
      options:
        type === "open" ? [{ value: "", isRightAnswer: false }] : options,
    });

    await existingQuiz.questions.push(newQuestion);

    const updatedQuiz = await existingQuiz.save();

    return res.status(201).json({
      data: {
        question_id: updatedQuiz?.questions?.at(-1)?.id,
      },
    });
  }

  if (quizId) {
    if (req.method === "GET") {
      Quiz.findById(quizId)
        .then((quiz) => {
          if (!quiz) {
            return res.status(404).json({
              error: {
                message: `Question with ID ${questionId} not found in Quiz with ID ${quizId}`,
              },
            });
          }
          const questions = (quiz as QuizModel).questions.map(
            ({ _id, title }) => ({
              _id,
              title,
            })
          );
          const currentQuestion =
            (quiz as QuizModel).questions.find(
              (q) => q._id.toString() === questionId
            ) || null;

          return res.status(200).json({
            data: {
              questions,
              currentQuestion,
            },
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: {
              message: `Couldn't find Question with ID ${questionId} in Quiz with ID ${quizId}: ${err}`,
            },
          });
        });
    }

    if (req.method === "PATCH") {
      if (questionId) {
        Quiz.findOneAndUpdate(
          { _id: quizId, "questions._id": questionId },
          { $set: formatObject({ obj: req.body, editQuestion: true }) },
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
            return res.status(200).json({
              data: question,
            });
          })
          .catch((err) => {
            return res.status(500).json({
              error: {
                message: `Couldn't update question with ID ${questionId} in Quiz with ID ${quizId}: ${err}`,
              },
            });
          });
      } else {
        Quiz.findOneAndUpdate(
          { _id: quizId },
          { $set: formatObject({ obj: req.body, editQuestion: false }) },
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
            return res.status(200).json({
              data: quiz,
            });
          })
          .catch((err) => {
            return res.status(500).json({
              error: {
                message: `Couldn't update quiz with id ${quizId}: ${err}`,
              },
            });
          });
      }
    }
  }
}

export default handler;
