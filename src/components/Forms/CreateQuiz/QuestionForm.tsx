import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { FormEvent, useContext } from "react";
import { Formik } from "formik";
import useSWR from "swr";
import { QuestionModel } from "@/models/question";
import OptionForm from "./OptionForm";

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

const QuestionForm = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const getQuestionById = async () => {
    if (router.query.quizId && router.query.questionId) {
      const result = await fetch(
        `/api/edit_quiz/${router.query.quizId}/question/${router.query.questionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: token as string,
          },
        }
      );

      return result.json();
    }
  };

  type Response = {
    data: QuestionModel;
  };

  const { data, error, isLoading } = useSWR<Response>(
    router.query
      ? `/api/edit_quiz/${router.query.quizId}/question/${router.query.questionId}`
      : null,
    router.query ? getQuestionById : null
  );

  if (error) {
    return <p>ERROR</p>;
  }

  if (isLoading || !router.query.quizId) {
    return <p>...is loading</p>;
  }

  const handleSubmit = async (values: QuestionModel) => {
    try {
      const result = await fetch(
        `/api/edit_quiz/${router.query.quizId}/question/${router.query.questionId}`,
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
        console.log(data);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.log(error);
      // router.replace("/edit_quiz");
    }
  };

  const { title, type, options } = (data as Response).data;

  const initialValues: QuestionModel = {
    title: title,
    type: type,
    options: options,
  };

  const handleAddQuestionClick = async (
    event: FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    try {
      const result = await fetch(`/api/edit_quiz/${router.query.quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token as string,
        },
      });
      if (result.ok) {
        const data = await result.json();
        router.replace(
          `/edit_quiz/${router.query.quizId}/question/${data.question_id}`
        );
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      router.replace("/edit_quiz");
    }
  };

  return (
    <>
      <button onClick={(event) => handleAddQuestionClick(event)}>
        Add Question
      </button>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
