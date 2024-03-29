import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { QuestionModel } from "@/models/question";
import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Field, FieldProps, Form, Formik } from "formik";
import QuestionForm from "@/components/Forms/QuestionForm";
import CreateResponseOptionForm from "@/components/Forms/CreateResponseOptionForm";
import Loading from "@/components/Loading/Loading";
import { useSession } from "next-auth/react";

interface QuizPageProps {
  data: QuizModelWithId;
}

export interface ResponseInitialValues {
  answers: QuizModelWithId["questions"];
}

const QuizPage = ({ data }: QuizPageProps) => {
  const router = useRouter();

  const { data: session } = useSession();
  const token = session && session.user;

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    data?.questions?.[0]?._id || null
  );

  const currentQuestionIndex =
    data?.questions?.findIndex(
      (question) => question?._id === currentQuestionId
    ) ?? 0;

  const initialValues: ResponseInitialValues = {
    answers: data?.questions || [],
  };

  const handleSubmit = async (values: ResponseInitialValues) => {
    try {
      const result = await fetch(`/api/response_quiz/${router.query.quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (result.ok) {
        const data = await result.json();
        router.replace(`/response/${data.data.response_id}`);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (router.isFallback) {
    return <Loading />;
  }

  return (
    <Formik initialValues={{ ...initialValues }} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <div className="flex direction-row grow height-100">
          <Form>
            <QuestionForm
              titleFieldName={`answers[${currentQuestionIndex}].title`}
              typeFieldName={`answers[${currentQuestionIndex}].type`}
              disableFields
            >
              {values.answers[currentQuestionIndex]?.type !== "open" ? (
                <CreateResponseOptionForm
                  questionIndex={currentQuestionIndex}
                />
              ) : (
                <Field
                  type="text"
                  name={`answers[${currentQuestionIndex}].options[0].value`}
                />
              )}
            </QuestionForm>
            <button
              className="align-self-center line-height-2 p-x-2 m-y-2 btn submit"
              type="submit"
            >
              Submit
            </button>
          </Form>
          <div className="sidebar surface-4 rad-shadow p-2 font-size-m">
            <Sidebar
              questions={data?.questions || []}
              setCurrentQuestionId={setCurrentQuestionId}
              currentQuestionId={currentQuestionId}
            />
          </div>
        </div>
      )}
    </Formik>
  );
};

export async function getStaticPaths() {
  await connectToDatabase();

  const docs = await Quiz.find({}, "_id");

  return {
    fallback: true,
    paths: docs?.map((quiz) => ({
      params: {
        quizId: quiz._id.toString(),
      },
    })),
  };
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<QuizPageProps>> {
  await connectToDatabase();

  const quizId = context.params.quizId;

  const quizData = await Quiz.findById(quizId);

  if (!quizData) {
    return {
      notFound: true, // Return a 404 page
    };
  }

  const data = JSON.stringify(quizData);

  const quizWithoutAnswers = { ...JSON.parse(data) };

  quizWithoutAnswers.questions.forEach((question: QuestionModel) => {
    question.options.forEach((option) => {
      option.isRightAnswer = false;
    });
  });

  return {
    props: {
      data: quizWithoutAnswers,
    },
  };
}

export default QuizPage;
