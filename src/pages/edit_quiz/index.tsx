import { FormEvent, useContext, useRef } from "react";
import router from "next/router";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";

const CreateQuiz = () => {
  const { data: session } = useSession();

  const initialValues = {
    title: "",
    description: "",
  };
  const handleSubmit = async (values: {
    title: string;
    description: string;
  }) => {
    try {
      const result = await fetch("/api/quizzes/create", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (result.ok) {
        const data = await result.json();
        router.replace(`/edit_quiz/${data.data.quiz_id}`);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      router.replace("/edit_quiz");
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="flex direction-column font-size-m m-y-2">
        <label className="font-size-l" htmlFor="title">
          Title
        </label>
        <Field
          name="title"
          type="text"
          required
          className="align-self-baseline"
        />
        <label className="font-size-l" htmlFor="description">
          Description
        </label>
        <Field
          as="textarea"
          name="description"
          type="text"
          required
          className="align-self-baseline"
        />
        <button
          className="align-self-baseline line-height-2 p-x-2 m-y-2 btn submit"
          type="submit"
        >
          Submit
        </button>
      </Form>
    </Formik>
  );
};

export default CreateQuiz;
