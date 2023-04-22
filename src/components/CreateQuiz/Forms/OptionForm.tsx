import { QuestionModel } from "@/models/question";
import { SetStateAction, useRef } from "react";

interface OptionFormProps {
  values: QuestionModel;
  setValues: (values: SetStateAction<QuestionModel>) => void;
}

const OptionForm = ({ values, setValues }: OptionFormProps) => {
  const optionInputRef = useRef<HTMLInputElement>(null);

  const handleCreateOption = () => {
    const newOption = {
      value: optionInputRef.current?.value || "",
      isRightAnswer: false,
    };
    const options = [...values.options, newOption];
    setValues({
      ...values,
      options: options,
    });
    if (optionInputRef.current) {
      optionInputRef.current.value = "";
    }
  };

  const handleCheckboxChange = (index: number) => {
    const currentOptionList = [...values.options];
    currentOptionList[index].isRightAnswer =
      !currentOptionList[index].isRightAnswer;
    setValues({
      ...values,
      options: currentOptionList,
    });
  };

  return (
    <div className="flex direction-column m-y-2">
      <ul className="no-bullet">
        {values.options?.map((option, index) => (
            <li className="flex direction-row" key={index}>
              <p>{option.value}</p>
              <input
                type="checkbox"
                checked={option.isRightAnswer}
                onChange={() => handleCheckboxChange(index)}
                disabled={
                  !!(
                    values.type === "single_choice" &&
                    values.options.find((option) => option.isRightAnswer) &&
                    !option.isRightAnswer
                  )
                }
              />
            </li>
        ))}
      </ul>
      <input id="option" name="option" type="text" ref={optionInputRef} />
      <button className="line-height-2 p-x-2 align-self-baseline btn info" type="button" onClick={() => handleCreateOption()}>
        Create Option
      </button>
    </div>
  );
};

export default OptionForm;
