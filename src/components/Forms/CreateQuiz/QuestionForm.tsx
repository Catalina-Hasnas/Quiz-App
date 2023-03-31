import { Dispatch, FormEvent, useEffect, useRef, useState } from "react";
import { Action, ActionTypes, Question } from "./reducer";

interface Props {
  currentQuestion: Question;
  dispatch: Dispatch<Action>;
}

const QuestionForm: React.FC<Props> = ({ currentQuestion, dispatch }) => {
  const [currentForm, setCurrentForm] = useState<Question>(currentQuestion);
  const [currentOption, setCurrentOption] = useState("");
  const optionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentForm(currentQuestion);
  }, [currentQuestion]);

  const addNewOption = () => {
    if (currentOption !== "") {
      const newOption = { value: currentOption, isRightAnswer: false };
      setCurrentForm({
        ...currentForm,
        options: [...currentForm.options, newOption],
      });
      setCurrentOption("");
      if (optionInputRef.current) {
        optionInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({
            type: ActionTypes.UPDATE_QUESTION,
            id: currentQuestion.id,
            values: currentForm,
          });
        }}
      >
        <input
          type="text"
          id="title"
          required
          value={currentForm.title}
          onChange={(event) => {
            setCurrentForm({ ...currentForm, title: event.target.value });
          }}
        />
        <select
          name="type"
          id="type"
          value={currentForm.type}
          onChange={(event) => {
            setCurrentForm({
              ...currentForm,
              type: event.target.value as "free" | "single" | "multiple",
            });
          }}
        >
          <option value="free">Free input</option>
          <option value="single">Single option</option>
          <option value="multiple">Multiple options</option>
        </select>
        {currentForm.type !== "free" && (
          <div>
            <ul>
              {currentForm.options?.map((option, index) => (
                <li key={index}>{option.value}</li>
              ))}
            </ul>
            <input
              ref={optionInputRef}
              type="text"
              value={currentOption}
              onChange={(e) => setCurrentOption(e.target.value)}
            />
            <button type="button" onClick={addNewOption}>
              Create Option
            </button>
          </div>
        )}
        <button type="submit"> SUBMIT QUESTION </button>
      </form>
    </div>
  );
};

export default QuestionForm;
