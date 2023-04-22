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
    <div>
      <ul>
        {values.options?.map((option, index) => (
          <>
            <li key={index}>{option.value}</li>
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
          </>
        ))}
      </ul>
      <input id="option" name="option" type="text" ref={optionInputRef} />
      <button type="button" onClick={() => handleCreateOption()}>
        Create Option
      </button>
    </div>
  );
};

export default OptionForm;
