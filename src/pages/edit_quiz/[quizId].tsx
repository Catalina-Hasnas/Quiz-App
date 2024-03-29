import { QuestionModel, QuestionModelWithId } from "@/models/question";
// import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { Form, Formik, FormikHelpers } from "formik";
import QuestionForm from "@/components/Forms/QuestionForm";
import CreateQuizOptionForm from "@/components/Forms/CreateQuizOptionForm";
import Sidebar from "@/components/Sidebar/Sidebar";
import Loading from "@/components/Loading/Loading";
import { useSession } from "next-auth/react";

export type QuizResponse = {
  data: {
    currentQuestion: QuestionModelWithId;
    questions: Pick<QuestionModelWithId, "_id" | "title">[];
  };
};

const EditQuestionPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session && session.user;

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );

  const url = currentQuestionId
    ? `/api/edit_quiz/${router.query.quizId}/question/${currentQuestionId}`
    : `/api/edit_quiz/${router.query.quizId}`;

  const getQuestionById = async () => {
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.json();
  };

  const {
    data,
    error,
    isLoading,
    mutate: getQuizById,
  } = useSWR<QuizResponse>(
    router.query.quizId && token ? [url, currentQuestionId] : null,
    router.query.quizId && token ? getQuestionById : null
  );

  if (error) {
    return <p>ERROR</p>;
  }

  if (isLoading || !router.query.quizId) {
    return <Loading />;
  }

  const initialValues: QuestionModel = {
    title: data?.data.currentQuestion?.title ?? "",
    type: data?.data.currentQuestion?.type ?? "open",
    options: data?.data.currentQuestion?.options ?? [],
  };

  const handleAddQuestionClick = () => {
    setCurrentQuestionId(null);
  };

  const handleSubmit = async (
    values: QuestionModel,
    actions: FormikHelpers<QuestionModel>
  ) => {
    // create new questions
    if (!currentQuestionId) {
      try {
        const result = await fetch(`/api/edit_quiz/${router.query.quizId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

    // edit current question
    if (currentQuestionId) {
      try {
        const result = await fetch(
          `/api/edit_quiz/${router.query.quizId}/question/${currentQuestionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
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
    <div className="flex direction-row grow height-100">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values }) => (
          <Form>
            <QuestionForm titleFieldName="title" typeFieldName="type">
              <>
                {values.type !== "open" ? <CreateQuizOptionForm /> : null}
                <button
                  className="align-self-center line-height-2 p-x-2 m-y-2 btn submit"
                  type="submit"
                >
                  Submit
                </button>
                <button
                  className="align-self-start line-height-2 p-x-2 m-y-2 btn"
                  type="button"
                  onClick={() => {
                    router.replace("/my_quizzes");
                  }}
                >
                  Save as draft
                </button>
              </>
            </QuestionForm>
          </Form>
        )}
      </Formik>
      <div className="sidebar surface-4 rad-shadow p-2 font-size-m">
        {data?.data.questions && (
          <Sidebar
            questions={data.data.questions}
            setCurrentQuestionId={setCurrentQuestionId}
            currentQuestionId={currentQuestionId}
          />
        )}
        <button
          className={`${
            currentQuestionId ? "" : "selected"
          } width-100 p-1 sidebar-item surface-4 line-height-2`}
          onClick={() => handleAddQuestionClick()}
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default EditQuestionPage;

export async function getServerSideProps() {
  return { props: {} };
}
