import { QuizPageData } from "@/pages/quizzes/page/[page]";
import Link from "next/link";

const QuizCard = ({ _id, creator, description, title }: QuizPageData) => {
  return (
    <div className="flex gap-0 direction-column quiz-card rad-shadow surface-3 p-t-4">
      <p className="p-05 author-pile info"> Created by: {creator} </p>
      <div className="line-decorated">
        <h1 className="title p-1">{title}</h1>
      </div>
      <p className="description surface-4 p-2">{description}</p>
      <div className="flex surface-4">
        <Link
          className="btn open-btn p-x-2 margin-inline-auto surface-3 rad-shadow-s"
          href={`/quizzes/${_id}`}
        >
          Take quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizCard;
