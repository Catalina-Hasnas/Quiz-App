import { Schema, model, models } from "mongoose";
import { Option, QuestionModel } from "./types";

const optionSchema = new Schema<Option>({
  value: { type: String, required: true },
  isRightAnswer: { type: Boolean, required: true },
});

const questionSchema = new Schema<QuestionModel>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [optionSchema] },
});

export const Question =
  models.Question<QuestionModel> || model("Question", questionSchema);
