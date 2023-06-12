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
    quizzes: Pick<QuizModelWithId, "_id" | "title">[];
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

  console.log(data?.data);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
      }}
    >
      <div style={{ gridColumn: "1 / span 2" }}>My Quizzes page</div>
      <div
        style={{ gridColumn: "1", display: "flex", flexDirection: "column" }}
      >
        <p>Quizzes that I have created</p>
        {data?.data.quizzes &&
          data?.data.quizzes.map((quiz) => (
            <Link key={quiz._id} href={`/my_quizzes/${quiz._id}`}>
              {quiz.title}
            </Link>
          ))}
      </div>

      <div
        style={{ gridColumn: "2", display: "flex", flexDirection: "column" }}
      >
        {data?.data.responses &&
          data?.data.responses.map((response) => (
            <>
              <p>Quizzes that I have responded to</p>

              <Link key={response._id} href={`/response/${response._id}`}>
                {response.quiz_title}
              </Link>
              <p> {response.reviewed ? "reviewed" : "not reviewed yet"} </p>
            </>
          ))}
      </div>
    </div>
  );
};

export default MyQuizzesPage;

export async function getServerSideProps() {
  return { props: {} };
}
