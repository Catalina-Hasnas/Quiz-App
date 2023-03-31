import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import { Question } from "./question";
import { QuizModel } from "./types";

const quizSchema = new Schema<QuizModel>({
  title: { type: String, required: true },
  questions: [Question],
  creator_id: { type: ObjectId, required: true, ref: "User" },
});

export const Quiz = models.Quiz<QuizModel> || model("Quiz", quizSchema);
