import { QuizPageData } from "@/pages/quizzes/page/[page]";
import Link from "next/link";

const QuizCard = ({ _id, creator_id, description, title }: QuizPageData) => {
  return (
    <div
      style={{
        padding: "30px",
        border: "1px solid white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>{title}</h1>
      <p>{description}</p>
      <div style={{ padding: "40px", backgroundColor: "blueviolet" }}> </div>
      <button style={{ padding: "5px" }} className="success">
        <Link href={`/quizzes/${_id}`}>OPEN</Link>
      </button>
      <p> Created by: {creator_id.name} </p>
    </div>
  );
};

export default QuizCard;
