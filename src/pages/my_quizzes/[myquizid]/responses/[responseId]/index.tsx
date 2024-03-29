import { QuizModelWithId } from "@/models/quiz";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Field, FieldInputProps, Form, Formik } from "formik";
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

const MyQuizzesResponsePage = () => {
  const router = useRouter();

  const { data: session } = useSession();
  const token = session && session.user;

  const getResponseById = async () => {
    const result = await fetch(`/api/response/${router.query.responseId}`, {
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

  const [rightAnswersNumber, setRightAnswersNumber] = useState<number>(0);

  const {
    data: responseData,
    error,
    isLoading,
  } = useSWR<ResponseDataType>(
    router.query.responseId && token
      ? [`/api/response/${router.query.responseId}`]
      : null,
    router.query.responseId && token ? getResponseById : null
  );

  const data = responseData?.data;

  useEffect(() => {
    if (data?.response._id) {
      setCurrentQuestionId(data.response.answers[0]._id);
      setRightAnswersNumber(data.testResults.rightAnswers.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.response._id]);

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
        return "Please review this";
      }
      if (data?.testResults.rightAnswers.includes(currentQuestionId)) {
        return "the respondent got this right";
      }
      if (
        data?.testResults.wrongAnswers.find(
          (item) => item.question_id === currentQuestionId
        )
      ) {
        return "the respondent got this wrong";
      }
    }
    return null;
  };

  const message = getQuestionResult();

  const handleSubmit = async (values: ResponseInitialValues) => {
    try {
      const result = await fetch(`/api/response/${router.query.responseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (result.ok) {
        const data = await result.json();
        // router.replace(`/response/${data.data.response_id}`);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Formik initialValues={{ ...initialValues }} onSubmit={handleSubmit}>
      {({ values }) => (
        <div className="flex direction-row grow height-100">
          <Form>
            {message && <h3 className="m-y-2">{message}</h3>}
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
                <>
                  <Field
                    type="text"
                    name={`answers[${currentQuestionIndex}].options[0].value`}
                    disabled
                  />
                  <label
                    htmlFor={`answers[${currentQuestionIndex}].options[0].isRightAnswer`}
                  >
                    is right answer
                  </label>
                  <Field
                    type="checkbox"
                    name={`answers[${currentQuestionIndex}].options[0].isRightAnswer`}
                  >
                    {({ field }: { field: FieldInputProps<string> }) => {
                      return (
                        <input
                          {...field}
                          className="align-self-baseline"
                          type="checkbox"
                          onChange={(e) => {
                            field.onChange(e);
                            setRightAnswersNumber(
                              field.value
                                ? rightAnswersNumber - 1
                                : rightAnswersNumber + 1
                            );
                          }}
                        />
                      );
                    }}
                  </Field>
                </>
              )}
            </QuestionForm>
            <h3>{`${rightAnswersNumber}/${data?.response.answers.length}`}</h3>
            {!data?.response.reviewed && (
              <button
                className="align-self-center line-height-2 p-x-2 m-y-2 btn submit"
                type="submit"
              >
                Submit
              </button>
            )}
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

export default MyQuizzesResponsePage;

export async function getServerSideProps() {
  return { props: {} };
}
