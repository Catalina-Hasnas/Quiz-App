import { ObjectId } from "mongoose";

export interface UserModel {
  email: string;
  password: string;
}

export interface Option {
  id: string;
  value: string;
  isRightAnswer: boolean;
}

enum QuestionEnum {
  OPEN = "open",
  SINGLE_CHOICE = "single_choice",
  MULTI_CHOICE = "multi_choice",
}

type QuestionType = keyof typeof QuestionEnum;

export interface QuestionModel {
  title: string;
  type: QuestionType;
  options: Option[];
}

export interface QuizModel {
  title: string;
  questions: QuestionModel[];
  creator_id: ObjectId;
}
