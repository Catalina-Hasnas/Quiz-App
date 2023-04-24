import { AuthContext } from "@/pages/_app";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { QuizModelWithId } from "@/models/quiz";

interface MyQuizResponse {
  data: {
    quiz: QuizModelWithId;
  };
}

const MyQuizPage = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const getMyQuizzes = async () => {
    const result = await fetch(`/api/quizzes/${router.query.myquizid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token as string,
      },
    });
    return result.json();
  };

  const { data, isLoading, error } = useSWR<MyQuizResponse>(
    token && router.query.myquizid
      ? [`/api/quizzes/${router.query.myquizid}`]
      : null,
    token && router.query.myquizid ? getMyQuizzes : null
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>My Quiz page</div>
      {isLoading && <p>is loading...</p>}
      {data && <p> {data.data.quiz.description} </p>}
      <Link href={`/edit_quiz/${router.query.myquizid}`}>Edit/ View quiz</Link>
      <Link href={`/my_quizzes/${router.query.myquizid}/responses`}>
        View Responses
      </Link>
    </div>
  );
};

export default MyQuizPage;
