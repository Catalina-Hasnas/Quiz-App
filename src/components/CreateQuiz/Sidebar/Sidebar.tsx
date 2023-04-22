import { QuestionModelWithId } from "@/models/question";
import { SetStateAction } from "react";

interface SidebarProps {
  questions: Pick<QuestionModelWithId, "_id" | "title">[];
  setCurrentQuestionId: (value: SetStateAction<string | null>) => void;
}

const Sidebar = ({ questions, setCurrentQuestionId }: SidebarProps) => {
  return (
    <ul>
      {questions?.map((question, index) => {
        return (
          <li key={index} onClick={() => setCurrentQuestionId(question._id)}>
            {question.title}
          </li>
        );
      })}
    </ul>
  );
};

export default Sidebar;
