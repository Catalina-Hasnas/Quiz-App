import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";

interface QuizPageProps {
  data: QuizModelWithId;
}

const QuizPage = ({ data }: QuizPageProps) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>Quiz Title</p>
      <p> {data.title && data.title} </p>
    </div>
  );
};

export async function getStaticPaths() {
  await connectToDatabase();

  const docs = await Quiz.find({}, "_id");

  return {
    fallback: true,
    paths: docs?.map((quiz) => ({
      params: {
        quizId: quiz._id.toString(),
      },
    })),
  };
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<QuizPageProps>> {
  await connectToDatabase();

  const quizId = context.params.quizId;

  const quizData = await Quiz.findById(quizId);

  const data = JSON.stringify(quizData);

  return {
    props: {
      data: JSON.parse(data),
    },
    revalidate: 1,
  };
}

export default QuizPage;
