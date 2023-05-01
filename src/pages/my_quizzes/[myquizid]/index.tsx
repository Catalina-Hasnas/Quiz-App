import { AuthContext } from "@/pages/_app";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { QuizByIdResponse } from "@/services/quiz/types";

const MyQuizPage = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const getMyQuizzes = async () => {
    const result = await fetch(
      `/api/quizzes/${router.query.myquizid}?filter=user_quizzes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token as string,
        },
      }
    );
    return result.json();
  };

  const { data, isLoading, error } = useSWR<QuizByIdResponse>(
    token && router.query.myquizid
      ? [`/api/quizzes/${router.query.myquizid}`]
      : null,
    token && router.query.myquizid ? getMyQuizzes : null
  );

  const handlePublishClick = async () => {
    try {
      const result = await fetch(`/api/edit_quiz/${router.query.myquizid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: token as string,
        },
        body: JSON.stringify({ status: "published" }),
      });
      if (result.ok) {
        const data = await result.json();
        console.log(data);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {isLoading && <p>is loading...</p>}
      {data && (
        <>
          <p> {data.data.quiz.title} </p> <p> {data.data.quiz.description} </p>
        </>
      )}
      <Link href={`/edit_quiz/${router.query.myquizid}`}>Edit/ View quiz</Link>
      {data?.data.quiz.status === "draft" && (
        <button onClick={() => handlePublishClick()} className="p-1 btn">
          Publish
        </button>
      )}
      <Link href={`/my_quizzes/${router.query.myquizid}/responses`}>
        View Responses
      </Link>
    </div>
  );
};

export default MyQuizPage;
