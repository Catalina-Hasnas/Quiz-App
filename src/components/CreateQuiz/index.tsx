import { QuestionModel, QuestionModelWithId } from "@/models/question";
import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import useSWR from "swr";
import QuestionForm from "./Forms/QuestionForm";
import Sidebar from "./Sidebar/Sidebar";

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
  } = useSWR<QuizResponse>(
    router.query.quizId ? [url, currentQuestionId] : null,
    router.query.quizId ? getQuestionById : null
  );

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
    <div className="flex direction-row grow height-100">
      <QuestionForm
        currentQuestionId={currentQuestionId}
        setCurrentQuestionId={setCurrentQuestionId}
        initialValues={initialValues}
        getQuizById={getQuizById}
      />
      <div className="sidebar surface-4 rad-shadow p-2 font-size-m">
        {data?.data.questions && (
          <Sidebar
          questions={data.data.questions}
          setCurrentQuestionId={setCurrentQuestionId}
          currentQuestionId={currentQuestionId}
          />
          )}
        <button className={`${currentQuestionId ? '' : 'selected'} width-100 p-1 sidebar-item surface-4 line-height-2`} onClick={() => handleAddQuestionClick()}>Add Question</button>
      </div>
    </div>
  );
};

export default CreateQuiz;
