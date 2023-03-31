export interface Question {
  id: string;
  title: string;
  type: "free" | "single" | "multiple";
  options: Option[];
}

export interface Option {
  value: string;
  isRightAnswer: boolean;
}

export interface QuizFormState {
  questions: Question[];
  currentQuestion: Question | null;
}

export enum ActionTypes {
  ADD_QUESTION = "ADD QUESTION",
  UPDATE_CURRENT_QUESTION = "UPDATE_CURRENT_QUESTION",
  UPDATE_QUESTION = "UPDATE_QUESTION",
}

type AddQuestion = {
  type: ActionTypes.ADD_QUESTION;
};
type UpdateCurrentQuestion = {
  type: ActionTypes.UPDATE_CURRENT_QUESTION;
  index: number;
};
type UpdateQuestion = {
  type: ActionTypes.UPDATE_QUESTION;
  id: string;
  values: Question;
};

export type Action = AddQuestion | UpdateCurrentQuestion | UpdateQuestion;

const addQuestion = (state: QuizFormState) => {
  const newQuestion: Question = {
    id: state.questions.length.toString(),
    title: "",
    type: "free",
    options: [],
  };

  return {
    ...state,
    questions: [...state.questions, newQuestion],
    currentQuestion: newQuestion,
  };
};

const updateCurrentQuestion = (state: QuizFormState, action: Action) => {
  const questionIndex = (action as UpdateCurrentQuestion).index;
  return {
    ...state,
    currentQuestion: state.questions[questionIndex],
  };
};

const updateQuestion = (state: QuizFormState, action: Action) => {
  const newQuestionValues = (action as UpdateQuestion).values;
  const questionId = (action as UpdateQuestion).id;
  const questionToBeUpdatedIndex = state.questions.findIndex(
    (item) => item.id === questionId
  );

  const questionsArr = [...state.questions];

  if (questionToBeUpdatedIndex !== -1) {
    questionsArr[questionToBeUpdatedIndex] = newQuestionValues;
  }

  return {
    ...state,
    questions: questionsArr,
  };
};

export const reducer = (
  state: QuizFormState,
  action: Action
): QuizFormState => {
  switch (action.type) {
    case ActionTypes.ADD_QUESTION:
      return addQuestion(state);
    case ActionTypes.UPDATE_CURRENT_QUESTION:
      return updateCurrentQuestion(state, action);
    case ActionTypes.UPDATE_QUESTION:
      return updateQuestion(state, action);
    default:
      return state;
  }
};
