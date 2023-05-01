import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { SetStateAction, useContext } from "react";
import { Formik, FormikHelpers } from "formik";
import { KeyedMutator } from "swr";
import { QuestionModel } from "@/models/question";
import OptionForm from "./OptionForm";
import { QuizResponse } from "../index";
import Link from "next/link";

interface QuestionFormProps {
  currentQuestionId: string | null;
  setCurrentQuestionId: (value: SetStateAction<string | null>) => void;
  initialValues: QuestionModel;
  getQuizById: KeyedMutator<QuizResponse>;
}

// const validate = (values) => {
//   const errors = {};

//   if (!values.firstName) {
//     errors.firstName = "Required";
//   } else if (values.firstName.length > 15) {
//     errors.firstName = "Must be 15 characters or less";
//   }

//   if (!values.lastName) {
//     errors.lastName = "Required";
//   } else if (values.lastName.length > 20) {
//     errors.lastName = "Must be 20 characters or less";
//   }

//   if (!values.email) {
//     errors.email = "Required";
//   } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
//     errors.email = "Invalid email address";
//   }

//   return errors;
// };

const QuestionForm = ({
  initialValues,
  currentQuestionId,
  setCurrentQuestionId,
  getQuizById,
}: QuestionFormProps) => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const handleSubmit = async (
    values: QuestionModel,
    actions: FormikHelpers<QuestionModel>
  ) => {
    if (!currentQuestionId) {
      try {
        const result = await fetch(`/api/edit_quiz/${router.query.quizId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token as string,
          },
          body: JSON.stringify(values),
        });
        if (result.ok) {
          const data = await result.json();
          getQuizById();
          setCurrentQuestionId(null);
          actions.resetForm({
            values: {
              title: "",
              type: "open",
              options: [],
            },
          });
        } else {
          const errorData = await result.json();
          throw new Error(errorData.error.message);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (currentQuestionId) {
      try {
        const result = await fetch(
          `/api/edit_quiz/${router.query.quizId}/question/${currentQuestionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              authorization: token as string,
            },
            body: JSON.stringify(values),
          }
        );
        if (result.ok) {
          const data = await result.json();
          getQuizById();
          setCurrentQuestionId(null);
        } else {
          const errorData = await result.json();
          throw new Error(errorData.error.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="grow-1 p-2">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
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
            />
            {touched.title && errors.title ? <div>{errors.title}</div> : null}
            <label htmlFor="type">Type</label>
            <select
              name="type"
              id="type"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.type}
            >
              <option value="open">Free input</option>
              <option value="single_choice">Single option</option>
              <option value="multi_choice">Multiple options</option>
            </select>
            {touched.type && errors.type ? <div>{errors.type}</div> : null}
            {values.type !== "open" && (
              <OptionForm values={values} setValues={setValues} />
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
      <Link href="/my_quizzes">
        <button className="p-1 btn"> Save as Draft </button>
      </Link>
    </div>
  );
};

export default QuestionForm;
