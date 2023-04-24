import Link from "next/link";
import useSWR from "swr";
import { useContext } from "react";
import { QuizModelWithId } from "@/models/quiz";
import { AuthContext } from "@/pages/_app";

interface MyQuizzesResponse {
  data: {
    quizzes: Pick<QuizModelWithId, "_id" | "title">[];
  };
}

const MyQuizzes = () => {
  const { token } = useContext(AuthContext);

  const getMyQuizzes = async () => {
    const result = await fetch("/api/my_quizzes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token as string,
      },
    });
    return result.json();
  };

  const { data, isLoading, error } = useSWR<MyQuizzesResponse>(
    token ? ["/api/my_quizzes"] : null,
    token ? getMyQuizzes : null
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error!</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>My Quizzes page</div>
      {data?.data.quizzes &&
        data?.data.quizzes.map((quiz) => (
          <Link key={quiz._id} href={`/my_quizzes/${quiz._id}`}>
            {quiz.title}
          </Link>
        ))}
    </div>
  );
};

export default MyQuizzes;
