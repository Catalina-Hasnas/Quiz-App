import { QuestionModel } from "@/models/question";
import { Fragment, SetStateAction, useRef } from "react";

interface OptionFormProps {
  values: QuestionModel;
  setValues: (values: SetStateAction<QuestionModel>) => void;
  isResponse: boolean;
}

const OptionForm = ({ values, setValues, isResponse }: OptionFormProps) => {
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
      <div className="options grid gap-1">
        {values.options?.map((option, index) => (
          <Fragment key={index}>
            <input
              className="checkbox m-1 m-y-2"
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
            <p className="p-1 word-break-all">{option.value}</p>
          </Fragment>
        ))}
      </div>
      {!isResponse ? (
        <div className="flex">
          <input
            className="align-self-center grow-1"
            id="option"
            name="option"
            type="text"
            ref={optionInputRef}
          />
          <button
            className="p-x-2 btn info"
            type="button"
            onClick={() => handleCreateOption()}
          >
            Create Option
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default OptionForm;
