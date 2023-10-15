import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { QuizByIdResponse } from "@/services/quiz/types";
import { useSession } from "next-auth/react";

const MyQuizPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session && session.user;

  const getMyQuiz = async () => {
    const result = await fetch(
      `/api/quizzes/${router.query.myquizid}?filter=user_quizzes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result.json();
  };

  const {
    data,
    isLoading,
    mutate: getMyQuizById,
  } = useSWR<QuizByIdResponse>(
    token && router.query.myquizid
      ? [`/api/quizzes/${router.query.myquizid}`]
      : null,
    token && router.query.myquizid ? getMyQuiz : null
  );

  const handleStatusChange = async (status: string) => {
    try {
      const result = await fetch(`/api/edit_quiz/${router.query.myquizid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
      });
      if (result.ok) {
        await getMyQuizById();
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="my-quiz-id m-y-1 p-2 surface-3 text-1 rad-shadow flex direction-column">
      {isLoading && <p>is loading...</p>}
      {data && (
        <>
          <h1>{data.data.quiz.title}</h1>
          <div className="description p-2 m-y-2">
            <p>{data.data.quiz.description}</p>
          </div>
        </>
      )}
      <div className="buttons flex wrap grow text-align-center justify-center align-items-center m-y-2 p-x-2">
        <Link href={`/edit_quiz/${router.query.myquizid}`} className="btn info p-05 p-x-2">
          {data?.data.quiz.status === "removed"
            ? "View quiz"
            : "Edit / View quiz"}
        </Link>
        {data?.data.quiz.status === "draft" && (
          <button
            onClick={() => handleStatusChange("published")}
            className="btn line-height-2 submit p-05 p-x-2"
          >
            Publish
          </button>
        )}
        {data?.data.quiz.status !== "removed" && (
          <button
            onClick={() => handleStatusChange("removed")}
            className="btn line-height-2 failure p-05 p-x-2"
          >
            Remove
          </button>
        )}
        <Link href={`/my_quizzes/${router.query.myquizid}/responses`} className="btn info p-05 p-x-2">
          View Responses
        </Link>
      </div>
    </div>
  );
};

export default MyQuizPage;

export async function getServerSideProps() {
  return { props: {} };
}
