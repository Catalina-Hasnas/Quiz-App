import { QuizModelWithId } from "@/models/quiz";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Field, Form, Formik } from "formik";
import QuestionForm from "@/components/Forms/QuestionForm";
import CreateResponseOptionForm from "@/components/Forms/CreateResponseOptionForm";
import { ResponseModelWIthId } from "@/models/response";
import useSWR from "swr";
import Loading from "@/components/Loading/Loading";
import { useSession } from "next-auth/react";

export interface ResponseInitialValues {
  answers: QuizModelWithId["questions"];
}

interface ResponseDataType {
  data: {
    response: ResponseModelWIthId;
    testResults: {
      pending: string[];
      rightAnswers: string[];
      wrongAnswers: {
        question_id: string;
        correctOptionsId: string[];
      }[];
    };
  };
}

const ResponsePage = () => {
  const router = useRouter();

  const { data: session } = useSession();
  const token = session && session.user;

  const getResponseById = async () => {
    const result = await fetch(`/api/response/${router.query.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.json();
  };

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );

  const {
    data: responseData,
    error,
    isLoading,
  } = useSWR<ResponseDataType>(
    router.query.id && token ? [`/api/response/${router.query.id}`] : null,
    router.query.id && token ? getResponseById : null
  );

  const data = responseData?.data;

  useEffect(() => {
    if (data) {
      setCurrentQuestionId(data?.response?.answers[0]._id);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    console.log(error);
  }

  const currentQuestionIndex =
    data?.response?.answers?.findIndex(
      (question) => question?._id === currentQuestionId
    ) ?? 0;

  const initialValues: ResponseInitialValues = {
    answers: data?.response?.answers || [],
  };

  const getQuestionResult = () => {
    if (currentQuestionId) {
      if (data?.testResults.pending.includes(currentQuestionId)) {
        return "creator of this quiz hasn't reviewed that yet";
      }
      if (data?.testResults.rightAnswers.includes(currentQuestionId)) {
        return "you got this right";
      }
      if (
        data?.testResults.wrongAnswers.find(
          (item) => item.question_id === currentQuestionId
        )
      ) {
        return "you got this wrong";
      }
    }
    return null;
  };

  const message = getQuestionResult();

  return (
    <Formik initialValues={{ ...initialValues }} onSubmit={() => {}}>
      {({ values }) => (
        <div className="flex direction-row grow height-100">
          <Form>
            {message && <p>{message}</p>}
            <QuestionForm
              titleFieldName={`answers[${currentQuestionIndex}].title`}
              typeFieldName={`answers[${currentQuestionIndex}].type`}
              disableFields
            >
              {values.answers[currentQuestionIndex]?.type !== "open" ? (
                <CreateResponseOptionForm
                  questionIndex={currentQuestionIndex}
                  disableCheckbox
                  correctOptionsId={
                    data?.testResults.wrongAnswers.find(
                      (item) => item.question_id === currentQuestionId
                    )?.correctOptionsId
                  }
                />
              ) : (
                <Field
                  type="text"
                  name={`answers[${currentQuestionIndex}].options[0].value`}
                  disabled
                />
              )}
            </QuestionForm>
            <p>
              {`${data?.testResults.rightAnswers.length}/${data?.response.answers.length}`}
            </p>
          </Form>
          <div className="sidebar surface-4 rad-shadow p-2 font-size-m">
            <Sidebar
              questions={data?.response?.answers || []}
              setCurrentQuestionId={setCurrentQuestionId}
              currentQuestionId={currentQuestionId}
            />
          </div>
        </div>
      )}
    </Formik>
  );
};

export default ResponsePage;

export async function getServerSideProps() {
  return { props: {} };
}
