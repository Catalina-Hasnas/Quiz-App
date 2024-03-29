import { ResponseInitialValues } from "@/pages/quizzes/[quizId]";
import { Field, useFormikContext } from "formik";
import { Fragment } from "react";

interface CreateResponseOptionFormProps {
  questionIndex: number;
  disableCheckbox?: boolean;
  correctOptionsId?: string[];
}

const CreateResponseOptionForm = ({
  questionIndex,
  disableCheckbox = false,
  correctOptionsId,
}: CreateResponseOptionFormProps) => {
  const { values } = useFormikContext<ResponseInitialValues>();

  return (
    <div className="flex direction-column m-y-2">
      <div className="options grid gap-1">
        {values.answers[questionIndex]?.options?.map((option, index) => {
          const isRightOption =
            correctOptionsId &&
            option._id &&
            correctOptionsId.includes(option._id);
          const isWrongOptionSelected =
            option.isRightAnswer &&
            correctOptionsId &&
            option._id &&
            !correctOptionsId?.includes(option._id);

          return (
            <Fragment key={index}>
              <Field
                name={`answers[${questionIndex}].options[${index}].isRightAnswer`}
                className={`checkbox m-1 m-y-2 ${
                  isRightOption ? "right" : ""
                } ${isWrongOptionSelected ? "wrong" : ""}`}
                type="checkbox"
                disabled={
                  disableCheckbox ||
                  !!(
                    values.answers[questionIndex]?.type === "single_choice" &&
                    values.answers[questionIndex]?.options.find(
                      (option) => option.isRightAnswer
                    ) &&
                    !option.isRightAnswer
                  )
                }
              />
              <p className="p-1 word-break-all">{option.value}</p>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CreateResponseOptionForm;
