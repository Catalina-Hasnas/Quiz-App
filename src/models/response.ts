import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import { QuestionModelWithId, questionSchema } from "./question";

export interface ResponseModel {
  quiz_id: ObjectId | string;
  answers: QuestionModelWithId[];
  respondent_id: ObjectId | string;
}

const quizSchema = new Schema<ResponseModel>({
  quiz_id: { type: ObjectId, required: true, ref: "Quiz" },
  answers: [questionSchema],
  respondent_id: { type: ObjectId, required: true, ref: "User" },
});

const Response =
  // @ts-ignore
  models.Response<ResponseModel> || model("Response", quizSchema);

export default Response;
