import { QuizByIdResponse } from "@/services/quiz/types";
import { useRouter } from "next/router";
import useSWR from "swr";

const QuizPage = () => {
  const router = useRouter();
  const getMyQuizzes = async () => {
    const result = await fetch(`/api/quizzes/${router.query.quizId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.json();
  };

  const { data, isLoading, error } = useSWR<QuizByIdResponse>(
    router.query.quizId
      ? [`/api/quizzes/${router.query.quizId}?filter=none`]
      : null,
    router.query.quizId ? getMyQuizzes : null
  );
  return <div>Quiz page</div>;
};

export default QuizPage;
