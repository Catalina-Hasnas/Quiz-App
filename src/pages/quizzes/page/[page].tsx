import QuizCard from "@/components/Quiz/QuizCard";
import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

export interface QuizPageData
  extends Omit<QuizModelWithId, "creator_id" | "questions" | "status"> {
  creator: string;
}

export interface QuizzesPageProps {
  data: QuizPageData[];
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

  const docs = await Quiz.aggregate([
    {
      $match: { status: "published" },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: startIndex,
    },
    {
      $limit: ITEMS_PER_PAGE,
    },
    {
      $lookup: {
        from: "users",
        localField: "creator_id",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $project: {
        _id: 1,
        creator: { $arrayElemAt: ["$creator.name", 0] },
        title: 1,
        description: 1,
      },
    },
  ]);

  const data = JSON.parse(JSON.stringify(docs)) as QuizPageData[];

  return {
    props: {
      data,
      currentPage,
      totalPages,
    },
    revalidate: currentPage === 0 ? 1 : undefined,
  };
};

export default QuizzesPage;
