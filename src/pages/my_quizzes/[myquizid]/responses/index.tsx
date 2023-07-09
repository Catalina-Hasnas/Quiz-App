import Loading from "@/components/Loading/Loading";
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
    return <Loading />;
  }

  return (
    <div className="responses-page surface-3 m-y-2 p-x-2 flex direction-column">
      <h1 className="text-align-center m-y-2">Responses to my quiz</h1>
      <div className="grid gap-2 responses">
        {data?.data?.responses.map((response) => {
          return (
            <div
              key={response._id}
              className={`response p-1 ${response.reviewed && "reviewed"}`}
            >
              <p className="respondent">
                Respondent: <span>{response.respondent}</span>
              </p>
              <div className="flex gap-0 align-items-center m-y-1">
                <Link
                  href={`/my_quizzes/${router.query.myquizid}/responses/${response._id}`}
                  className="btn info p-x-2"
                >
                  OPEN
                </Link>
                <span className="pill reviewed">
                  {response.reviewed && "Reviewed"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsesToMyQuiz;

export async function getServerSideProps() {
  return { props: {} };
}
