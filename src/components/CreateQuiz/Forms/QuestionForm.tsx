import { useRef } from "react";
import { Formik, FormikHelpers } from "formik";
import { QuestionModel } from "@/models/question";
import OptionForm from "./OptionForm";
import Link from "next/link";

interface QuestionFormProps {
  handleSubmit: (
    values: QuestionModel,
    actions: FormikHelpers<QuestionModel>
  ) => void;
  initialValues: QuestionModel;
  isResponse?: boolean;
}

const QuestionForm = ({
  initialValues,
  handleSubmit,
  isResponse = false,
}: QuestionFormProps) => {
  const handleResponseSubmit = (
    values: QuestionModel,
    actions: FormikHelpers<QuestionModel>
  ) => {
    const isOpenQuestionResponse =
      values.options.length === 1 && values.type === "open";

    const questionValues = isOpenQuestionResponse
      ? {
          ...values,
          options: [
            {
              value: values.options[0].value,
              isRightAnswer: false,
            },
          ],
        }
      : values;

    handleSubmit(questionValues, actions);
  };

  return (
    <div className="grow-1 p-2">
      <Formik
        initialValues={initialValues}
        onSubmit={handleResponseSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setValues,
        }) => (
          <form
            className="flex direction-column font-size-m gap-3"
            onSubmit={handleSubmit}
          >
            <label htmlFor="firstName">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.title}
              disabled={isResponse}
            />
            {touched.title && errors.title ? <div>{errors.title}</div> : null}
            <label htmlFor="type">Type</label>
            <select
              name="type"
              id="type"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.type}
              disabled={isResponse}
            >
              <option value="open">Free input</option>
              <option value="single_choice">Single option</option>
              <option value="multi_choice">Multiple options</option>
            </select>
            {touched.type && errors.type ? <div>{errors.type}</div> : null}
            {values.type === "open" && isResponse && (
              <input
                type="text"
                name="options[0].value"
                value={values.options[0]?.value}
                onChange={handleChange}
                onBlur={handleBlur}
              ></input>
            )}
            {values.type !== "open" && (
              <OptionForm
                values={values}
                setValues={setValues}
                isResponse={isResponse}
              />
            )}

            <button
              className="align-self-center line-height-2 p-x-2 m-y-2 btn submit"
              type="submit"
            >
              Submit
            </button>
          </form>
        )}
      </Formik>
      {!isResponse ? (
        <Link href="/my_quizzes">
          <button className="p-1 btn"> Save as Draft </button>
        </Link>
      ) : null}
    </div>
  );
};

export default QuestionForm;
