import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import { QuestionModelWithId, questionSchema } from "./question";

export type QuizStatus = "draft" | "published" | "removed";

export interface QuizModel {
  title: string;
  description: string;
  questions: QuestionModelWithId[];
  creator_id?: string;
  status: QuizStatus;
}

export interface QuizModelWithId extends Omit<QuizModel, "creator_id"> {
  _id: string;
  creator_id: string;
}

const quizSchema = new Schema<QuizModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [questionSchema],
  creator_id: { type: ObjectId, required: true, ref: "User" },
  status: { type: String, required: true },
});

// @ts-ignore
const Quiz = models.Quiz<QuizModel> || model("Quiz", quizSchema);

export default Quiz;
