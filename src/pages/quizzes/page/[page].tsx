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
  const startPage = currentPage - 2 <= 0 ? 1 : currentPage - 2;
  
  const pages = Array.from({ length: 5 }, (_, index) => {
    if(startPage + index > totalPages) {
      return;
    }
    return (
      <Link
        href={`/quizzes/page/${startPage + index}`}
        key={startPage + index}
      >
        <span
          className={
            currentPage === startPage + index ? "accent-box p-1" : "p-1"
          }
        >
          {startPage + index}
        </span>
      </Link>
    );
  });

  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1 className="m-y-2">Quizzes page</h1>
      <div className="grid gap-3 quiz-list">
        {data.map((quiz, index) => {
          return <QuizCard key={index} {...quiz} />;
        })}
        <div className="flex gap-0 justify-center align-items-center font-size-l font-weight-600 rad-shadow surface-3 p-2">
          {pages}
        </div>
      </div>
    </>
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
    params: { page: index.toString() + 1 },
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

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
    revalidate: currentPage === 1 ? 1 : undefined,
  };
};

export default QuizzesPage;
