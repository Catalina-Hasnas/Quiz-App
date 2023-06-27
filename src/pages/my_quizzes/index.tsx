import Link from "next/link";
import useSWR from "swr";
import { useContext } from "react";
import { QuizModelWithId } from "@/models/quiz";
import { AuthContext } from "@/pages/_app";
import { ResponseModelWIthId } from "@/models/response";

type ResponseType = Pick<ResponseModelWIthId, "_id" | "reviewed"> & {
  quiz_title: string;
};

interface MyQuizzesResponse {
  data: {
    quizzes: Pick<QuizModelWithId, "_id" | "title" | "status">[];
    responses: ResponseType[];
  };
}

const MyQuizzesPage = () => {
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
    <div className="my-quizzes grid gap-1 m-y-2">
      <div className="title surface-2 rad-shadow p-2">
        <h1 className="text-align-center text-1">My Quizzes page</h1>
      </div>

      <div className="created surface-4 rad-shadow p-1">
        <h3 className="text-align-center m-y-1">Quizzes that I have created</h3>
        <ul className="flex direction-column no-bullet m-y-1">
          {data?.data.quizzes &&
            data?.data.quizzes.map((quiz) => (
              <li key={quiz._id}>
                <Link key={quiz._id} href={`/my_quizzes/${quiz._id}`}>
                  {quiz.title}
                </Link>
                {quiz.status !== "published" && <span className={`pill ${quiz.status}`}>{quiz.status}</span>}
              </li>
            ))}
        </ul>
      </div>

      <div className="answered surface-3 rad-shadow p-1">
        <h3 className="text-align-center m-y-1">Quizzes that I have responded to</h3>
        <ul className="flex direction-column no-bullet m-y-1">
          {data?.data.responses &&
            data?.data.responses.map((response) => (
              <li key={response._id}>
                <Link key={response._id} href={`/response/${response._id}`}>
                  {response.quiz_title}
                </Link>
                <span className={`pill ${response.reviewed && 'reviewed'}`}>{response.reviewed ? "reviewed" : "not reviewed yet"} </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default MyQuizzesPage;

export async function getServerSideProps() {
  return { props: {} };
}
