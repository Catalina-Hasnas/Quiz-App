import { ResponseModelWIthId } from "@/models/response";
import { AuthContext } from "@/pages/_app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import useSWR from "swr";

interface MyQuizResponsesRequestResponse
  extends Omit<ResponseModelWIthId, "respondent_id"> {
  respondent: string;
}

interface MyQuizResponsesType {
  data: {
    responses: MyQuizResponsesRequestResponse[];
  };
}

const ResponsesToMyQuiz = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const getQuizResponses = async () => {
    const result = await fetch(`/api/response_quiz/${router.query.myquizid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token as string,
      },
    });
    return result.json();
  };

  const { data, isLoading } = useSWR<MyQuizResponsesType>(
    token && router.query.myquizid
      ? [`/api/response_quiz/${router.query.myquizid}`]
      : null,
    token && router.query.myquizid ? getQuizResponses : null
  );

  if (isLoading) {
    return <p> is loading...</p>;
  }

  return (
    <div>
      <p>Responses to my quiz</p>
      {data?.data?.responses.map((response) => {
        return (
          <div
            key={response._id}
            style={{
              padding: "30px",
              border: "1px solid white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p> {response.reviewed && "Reviewed"} </p>
            <button style={{ padding: "5px" }} className="success">
              <Link
                href={`/my_quizzes/${router.query.myquizid}/responses/${response._id}`}
              >
                OPEN
              </Link>
            </button>
            <p> Respondent: {response.respondent} </p>
          </div>
        );
      })}
    </div>
  );
};

export default ResponsesToMyQuiz;

export async function getServerSideProps() {
  return { props: {} };
}
