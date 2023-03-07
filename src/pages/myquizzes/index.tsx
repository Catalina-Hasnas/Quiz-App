import Link from "next/link";

const MyQuizzesPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>My Quizzes page</div>
      <Link href="/myquizzes/1"> My Draft Quiz 1 </Link>
      <Link href="/myquizzes/2"> My Draft Quiz 2 </Link>
    </div>
  );
};

export default MyQuizzesPage;
