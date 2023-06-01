import { QuestionModelWithId } from "@/models/question";
import { SetStateAction } from "react";

interface SidebarProps {
  questions: Pick<QuestionModelWithId, "_id" | "title">[];
  setCurrentQuestionId: (value: SetStateAction<string | null>) => void;
  currentQuestionId: string | null;
}

const Sidebar = ({
  questions,
  setCurrentQuestionId,
  currentQuestionId,
}: SidebarProps) => {
  return (
    <ul className="flex direction-column gap-3 m-y-2 no-bullet display-block">
      {questions?.map((question, index) => {
        return (
          <li
            className={`${
              currentQuestionId == question._id ? "selected" : ""
            } sidebar-item p-1`}
            key={index}
            onClick={() => setCurrentQuestionId(question._id)}
          >
            {question.title}
          </li>
        );
      })}
    </ul>
  );
};

export default Sidebar;
