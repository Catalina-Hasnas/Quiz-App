import QuizCard from "@/components/Quiz/QuizCard";
import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticProps } from "next";

interface QuizzesPageProps {
  data: QuizModelWithId[];
}

const QuizzesPage = ({ data }: QuizzesPageProps) => {
  return (
    <div>
      <p>Quizzes page</p>
      {data.map((quiz, index) => {
        return <QuizCard key={index} {...quiz} />;
      })}
    </div>
  );
};

export const getStaticProps: GetStaticProps<QuizzesPageProps> = async () => {
  try {
    await connectToDatabase();

    const docs = await Quiz.find({}).sort({ dateField: -1 }).limit(10);

    const data = JSON.parse(JSON.stringify(docs)) as QuizModelWithId[];

    return {
      props: {
        data,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      props: {
        data: [],
      },
    };
  }
};

export default QuizzesPage;
