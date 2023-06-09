import { Option, QuestionModelWithId } from "@/models/question";
import Quiz, { QuizModelWithId } from "@/models/quiz";
import Response from "@/models/response";
import User from "@/models/user";
import { verifyToken } from "@/services/auth/auth";
import { IUserToken } from "@/services/auth/types";
import { connectToDatabase } from "@/services/database.service";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const responseId = req.query.id;

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
      error: "You're not authorized to view a response.",
    });
  }

  let existingResponse;
  try {
    existingResponse = await Response.findById(responseId);
  } catch (err) {
    return res.status(500).json({
      error: {
        message: err,
      },
    });
  }

  if (!existingResponse) {
    return res.status(401).json({
      error: `The response with the id: ${responseId} doesn't exist.`,
    });
  }

  if (responseId) {
    if (req.method === "GET") {
      Response.findById(responseId)
        .then(async (response) => {
          if (!response) {
            return res.status(404).json({
              error: {
                message: `Couldn't find response with ID ${responseId}`,
              },
            });
          }

          const quizId = response.quiz_id;

          try {
            const quiz: QuizModelWithId | null = await Quiz.findById(quizId);

            if (!response.reviewed) {
              const getTestResults = () => {
                const pending = [];
                const rightAnswers = [];
                const wrongAnswers = [];

                if (quiz) {
                  for (let i = 0; i < quiz.questions.length; i++) {
                    const quizQuestion = quiz.questions[i];
                    const responseQuestion = response.answers[i];

                    if (quizQuestion.type === "open") {
                      pending.push(quizQuestion._id);
                    } else {
                      let isAllOptionsRight = true;
                      const correctOptionsId = [];

                      for (let j = 0; j < quizQuestion.options.length; j++) {
                        const quizOption = quizQuestion.options[j];
                        const responseOption = responseQuestion.options.find(
                          (option: Option) =>
                            option._id?.toString() ===
                            quizOption._id?.toString()
                        );

                        if (quizOption?._id && quizOption.isRightAnswer) {
                          correctOptionsId.push(quizOption._id.toString());
                        }

                        if (
                          responseOption &&
                          responseOption.isRightAnswer !==
                            quizOption.isRightAnswer
                        ) {
                          isAllOptionsRight = false;
                        }
                      }

                      if (isAllOptionsRight) {
                        rightAnswers.push(quizQuestion._id.toString());
                      } else {
                        wrongAnswers.push({
                          question_id: quizQuestion._id.toString(),
                          correctOptionsId,
                        });
                      }
                    }
                  }
                }

                return {
                  pending,
                  rightAnswers,
                  wrongAnswers,
                };
              };

              const testResults = getTestResults();

              const updatedResponse = await Response.findOneAndUpdate(
                { _id: responseId },
                { response_results: testResults },
                { new: true }
              );

              await updatedResponse.save();

              return res.status(200).json({
                data: {
                  response: updatedResponse,
                  testResults: updatedResponse.response_results,
                },
              });
            }

            return res.status(200).json({
              data: {
                response: response,
                testResults: response.response_results,
              },
            });
          } catch (err) {
            return res.status(500).json({
              error: {
                message: `Couldn't find quiz with ID ${quizId}: ${err}`,
              },
            });
          }
        })
        .catch((err: string) => {
          return res.status(500).json({
            error: {
              message: `Couldn't find response with ID ${responseId}: ${err}`,
            },
          });
        });
    }
    if (req.method === "PATCH") {
      const getRightOrWrongQuestions = ({ isRight }: { isRight: boolean }) => {
        const openQuestions = req.body.answers.filter(
          (answer: QuestionModelWithId) =>
            answer.type === "open" &&
            answer.options[0].isRightAnswer === isRight
        );

        if (isRight) {
          return openQuestions.map((answer: QuestionModelWithId) => {
            return answer._id;
          });
        }

        return openQuestions.map((answer: QuestionModelWithId) => {
          return { question_id: answer._id, correctOptionsId: [] };
        });
      };

      const newResponse = await Response.findOneAndUpdate(
        { _id: responseId },
        {
          $push: {
            "response_results.rightAnswers": getRightOrWrongQuestions({
              isRight: true,
            }),
            "response_results.wrongAnswers": getRightOrWrongQuestions({
              isRight: false,
            }),
          },
          $set: {
            reviewed: true,
            answers: req.body.answers,
            "response_results.pending": [],
          },
        },
        { new: true }
      );

      const updatedResponse = await newResponse.save();

      return res.status(200).json({
        data: {
          response: updatedResponse,
          testResults: updatedResponse.response_results,
        },
      });
    }
  }
}

export default handler;
