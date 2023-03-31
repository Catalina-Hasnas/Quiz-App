import { useReducer } from "react";
import QuestionForm from "./QuestionForm";
import { ActionTypes, QuizFormState, reducer } from "./reducer";

const QuizForm = () => {
  const initialState: QuizFormState = {
    questions: [],
    currentQuestion: null,
  };
  const [quizFormState, dispatch] = useReducer(reducer, initialState);

  const { questions, currentQuestion } = quizFormState;

  return (
    <div>
      <button onClick={() => dispatch({ type: ActionTypes.ADD_QUESTION })}>
        Add question +
      </button>
      <nav>
        <ul>
          {questions.map((question, index) => {
            return (
              <li
                key={index}
                onClick={() =>
                  dispatch({
                    type: ActionTypes.UPDATE_CURRENT_QUESTION,
                    index: index,
                  })
                }
              >
                Question {index}
              </li>
            );
          })}
        </ul>
      </nav>
      {currentQuestion && (
        <QuestionForm currentQuestion={currentQuestion} dispatch={dispatch} />
      )}
    </div>
  );
};

export default QuizForm;
