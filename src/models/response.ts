import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import { QuestionModelWithId, questionSchema } from "./question";

type ResponseResultsType = {
  pending: string[];
  rightAnswers: string[];
  wrongAnswers: {
    question_id: string;
    correctOptionsId: string[];
  }[];
};

const responseResultsSchema = new Schema<ResponseResultsType>({
  pending: [String],
  rightAnswers: [String],
  wrongAnswers: [
    {
      question_id: String,
      correctOptionsId: [String],
    },
  ],
});

export interface ResponseModel {
  quiz_id: ObjectId | string;
  answers: QuestionModelWithId[];
  respondent_id: ObjectId | string;
  reviewed: boolean;
  response_results?: ResponseResultsType;
}

export interface ResponseModelWIthId extends ResponseModel {
  _id: string;
}

const quizSchema = new Schema<ResponseModel>({
  quiz_id: { type: ObjectId, required: true, ref: "Quiz" },
  answers: [questionSchema],
  respondent_id: { type: ObjectId, required: true, ref: "User" },
  reviewed: { type: Boolean, required: true },
  response_results: responseResultsSchema,
});

const Response =
  // @ts-ignore
  models.Response<ResponseModel> || model("Response", quizSchema);

export default Response;
