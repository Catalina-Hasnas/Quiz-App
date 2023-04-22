interface IQuizCreatedSuccessful {
  quiz_id: string;
}

type HttpError = { message: string };

export interface ICreateQuizResponse {
  error: HttpError | null;
  data: IQuizCreatedSuccessful | null;
}

export interface IQuestionResponse {
  error: HttpError | null;
  data: IQuizCreatedSuccessful | null;
}
