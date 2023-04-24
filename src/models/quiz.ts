import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import { QuestionModelWithId, questionSchema } from "./question";

export interface QuizModel {
  title: string;
  description: string;
  questions: QuestionModelWithId[];
  creator_id?: string;
}

export interface QuizModelWithId extends QuizModel {
  _id: string;
}

const quizSchema = new Schema<QuizModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [questionSchema],
  creator_id: { type: ObjectId, required: true, ref: "User" },
});

// @ts-ignore
const Quiz = models.Quiz<QuizModel> || model("Quiz", quizSchema);

export default Quiz;
