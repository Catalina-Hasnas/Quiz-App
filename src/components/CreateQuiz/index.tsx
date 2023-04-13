import { QuestionModel, QuestionModelWithId } from "@/models/question";
import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import useSWR from "swr";
import QuestionForm from "./Forms/QuestionForm";

export type QuizResponse = {
  data: {
    currentQuestion: QuestionModelWithId;
    questions: Pick<QuestionModelWithId, "_id" | "title">[];
  };
};

const CreateQuiz = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

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
        authorization: token as string,
      },
    });
    return result.json();
  };

  const {
    data,
    error,
    isLoading,
    mutate: getQuizById,
  } = useSWR<QuizResponse>([url, currentQuestionId], getQuestionById);

  if (error) {
    return <p>ERROR</p>;
  }

  if (isLoading || !router.query.quizId) {
    return <p>...is loading</p>;
  }

  const initialValues: QuestionModel = {
    title: data?.data.currentQuestion?.title ?? "",
    type: data?.data.currentQuestion?.type ?? "open",
    options: data?.data.currentQuestion?.options ?? [],
  };

  const handleAddQuestionClick = () => {
    setCurrentQuestionId(null);
  };

  return (
    <div>
      <button onClick={() => handleAddQuestionClick()}>Add Question</button>
      <ul>
        {data?.data.questions?.map((question, index) => {
          return (
            <li key={index} onClick={() => setCurrentQuestionId(question._id)}>
              {question.title}
            </li>
          );
        })}
      </ul>
      <QuestionForm
        currentQuestionId={currentQuestionId}
        setCurrentQuestionId={setCurrentQuestionId}
        initialValues={initialValues}
        getQuizById={getQuizById}
      />
    </div>
  );
};

export default CreateQuiz;
