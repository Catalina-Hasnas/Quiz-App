import Link from "next/link";
import { useRouter } from "next/router";

const MyQuizPage = () => {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>My Quiz page</div>
      <Link href={`/myquizzes/${router.query.myquizid}/edit`}>Edit quiz</Link>
      <Link href={`/myquizzes/${router.query.myquizid}/responses`}>
        View Responses
      </Link>
    </div>
  );
};

export default MyQuizPage;
