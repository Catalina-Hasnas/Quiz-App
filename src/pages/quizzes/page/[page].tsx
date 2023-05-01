import QuizCard from "@/components/Quiz/QuizCard";
import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

interface QuizzesPageProps {
  data: QuizModelWithId[];
  currentPage: number;
  totalPages: number;
}

const QuizzesPage = ({ data, currentPage, totalPages }: QuizzesPageProps) => {
  const pages = Array.from({ length: totalPages }, (_, index) => (
    <Link href={`/quizzes/page/${index}`} key={index}>
      <span className={currentPage === index ? "accent" : "p-1"}>{index}</span>
    </Link>
  ));

  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Quizzes page</p>
      {data.map((quiz, index) => {
        return <QuizCard key={index} {...quiz} />;
      })}
      <div>{pages}</div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const getTotalPages = async () => {
  const totalItems = await Quiz.countDocuments();
  return Math.ceil(totalItems / ITEMS_PER_PAGE);
};

export async function getStaticPaths() {
  await connectToDatabase();

  const totalPages = await getTotalPages();

  const paths = Array.from({ length: totalPages }, (_, index) => ({
    params: { page: index.toString() },
  }));

  return { paths, fallback: true };
}

export const getStaticProps: GetStaticProps<QuizzesPageProps> = async ({
  params,
}) => {
  await connectToDatabase();

  const currentPage = parseInt(params?.page as string);
  const totalItems = await Quiz.countDocuments();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = currentPage * ITEMS_PER_PAGE;

  const docs: QuizModelWithId[] = await Quiz.find({})
    .sort({ _id: -1 })
    .skip(startIndex)
    .limit(ITEMS_PER_PAGE)
    .exec();

  const data = JSON.parse(JSON.stringify(docs)) as QuizModelWithId[];

  return {
    props: {
      data,
      currentPage,
      totalPages,
    },
    revalidate: currentPage === 0 ? 1 : undefined,
  };

  // { status: "published" }
};

export default QuizzesPage;
