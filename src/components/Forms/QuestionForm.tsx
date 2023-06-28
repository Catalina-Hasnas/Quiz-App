import { ReactNode } from "react";
import { Field } from "formik";

interface QuestionFormProps {
  titleFieldName: string;
  typeFieldName: string;
  disableFields?: boolean;
  children?: ReactNode;
}

const QuestionForm = ({
  titleFieldName,
  typeFieldName,
  disableFields = false,
  children,
}: QuestionFormProps) => {
  return (
    <div className="flex direction-column grow-1 m-y-2">
      <Field type="text" name={titleFieldName} disabled={disableFields} />
      <Field as="select" name={typeFieldName} disabled={disableFields}>
        <option value="open">Free input</option>
        <option value="single_choice">Single option</option>
        <option value="multi_choice">Multiple options</option>
      </Field>
      {children}
    </div>
  );
};

export default QuestionForm;
