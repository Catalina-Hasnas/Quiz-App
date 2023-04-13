import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { FormEvent, SetStateAction, useContext } from "react";
import { Formik, FormikHelpers } from "formik";
import useSWR, { KeyedMutator } from "swr";
import { QuestionModel, QuestionModelWithId } from "@/models/question";
import OptionForm from "./OptionForm";
import { QuizResponse } from "../index";

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

  // const getQuestionById = async () => {
  //   if (router.query.quizId) {
  //     const result = await fetch(
  //       `/api/edit_quiz/${router.query.quizId}/question/${questionId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           authorization: token as string,
  //         },
  //       }
  //     );

  //     return result.json();
  //   }
  // };

  // type Response = {
  //   data: QuestionModel;
  // };

  // const { data, error, isLoading } = useSWR<Response>(
  //   [
  //     `/api/edit_quiz/${router.query.quizId}/question/${questionId}`,
  //     questionId,
  //   ],
  //   getQuestionById
  // );

  // if (error) {
  //   return <p>ERROR</p>;
  // }

  // if (isLoading || !router.query.quizId) {
  //   return <p>...is loading</p>;
  // }

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
        // router.replace("/edit_quiz");
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
    <>
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
          <form onSubmit={handleSubmit}>
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

            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>
    </>
  );
};

export default QuestionForm;
