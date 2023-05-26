import { Schema, model, models } from "mongoose";

export interface Option {
  _id?: string;
  value: string;
  isRightAnswer: boolean;
}

const optionSchema = new Schema<Option>({
  value: { type: String, required: true },
  isRightAnswer: { type: Boolean, required: true },
});

export type QuestionType = "open" | "single_choice" | "multi_choice";

export interface QuestionModel {
  title: string;
  type: QuestionType;
  options: Option[];
}

export interface QuestionModelWithId extends QuestionModel {
  _id: string;
}

export const questionSchema = new Schema<QuestionModel>({
  title: { type: String, required: false },
  type: { type: String, required: true },
  options: [optionSchema],
});

const Question =
  // @ts-ignore
  models.Question<QuestionModel> || model("Question", questionSchema);

export default Question;
