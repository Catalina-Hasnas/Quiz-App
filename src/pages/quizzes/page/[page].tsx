import QuizCard from "@/components/Quiz/QuizCard";
import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { Field, Form, Formik } from "formik";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export interface QuizPageData
  extends Omit<QuizModelWithId, "creator_id" | "questions" | "status"> {
  creator: string;
}

export interface QuizzesPageProps {
  data: QuizPageData[];
  totalPages: number;
}

export const ITEMS_PER_PAGE = 5;

const QuizzesPage = ({ data, totalPages }: QuizzesPageProps) => {
  const router = useRouter();

  const currentPage = parseInt(router.query.page as string);

  const url = `/api/quizzes?search=${router.query.search}?&currentPage=${router.query.page}`;

  const getFilteredQuizzes = async () => {
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.json();
  };

  const { data: filteredData, isLoading } = useSWR<{ data: QuizzesPageProps }>(
    router.query.search ? [url, router.query.search, router.query.page] : null,
    router.query.search ? getFilteredQuizzes : null
  );

  useEffect(() => {
    if (filteredData) {
      setQuizzesPageData(filteredData.data);
    } else {
      setQuizzesPageData(undefined);
    }
  }, [filteredData]);

  const [quizzesPageData, setQuizzesPageData] = useState<
    QuizzesPageProps | undefined
  >({
    data,
    totalPages,
  });

  const startPage = currentPage - 2 <= 0 ? 1 : currentPage - 2;

  const pages = Array.from({ length: 5 }, (_, index) => {
    const totalItems = quizzesPageData?.totalPages ?? totalPages;
    if (startPage + index > totalItems) {
      return;
    }

    return (
      <Link
        href={
          router.query.search
            ? `/quizzes/page/${startPage + index}?search=${router.query.search}`
            : `/quizzes/page/${startPage + index}`
        }
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

  const handleSubmit = async (values: { searchQuery: string }) => {
    if (!router.query.search || router.query.search !== values.searchQuery) {
      router.push(`/quizzes/page/1?search=${values.searchQuery}`);
    }
  };

  const some = quizzesPageData?.data ?? data;

  return (
    <>
      <div className="flex gap-0 direction-column p-1 m-1 surface-2 rad-shadow">
        <h1 className="text-align-center text-1">Quizzes page</h1>
        <Formik
          initialValues={{ searchQuery: `${router.query.search ?? ""}` }}
          onSubmit={handleSubmit}
        >
          <Form className="flex justify-center">
            <Field
              className="text-2 text-align-center font-size-m search-field"
              type="text"
              name="searchQuery"
              placeholder="Search..."
            />
            <button type="submit" className="p-1 btn-link text-1 search-button">
              <i className="gg-search"></i>
            </button>
            <button
              type="reset"
              onClick={() => {
                router.push("/quizzes/page/1");
              }}
              className="p-1 btn-link text-1 search-button"
            >
              X
            </button>
          </Form>
        </Formik>
      </div>
      {router.isFallback || isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-3 quiz-list">
          {some.map((quiz, index) => {
            return <QuizCard key={index} {...quiz} />;
          })}
          <div className="flex gap-0 justify-center align-items-center font-size-l font-weight-600 rad-shadow surface-3 p-2">
            {pages}
          </div>
        </div>
      )}
    </>
  );
};

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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const totalItemsPipeline = [
    {
      $match: { status: "published" },
    },
    {
      $count: "totalItems",
    },
  ];

  const totalItemsResult = await Quiz.aggregate(totalItemsPipeline);
  const totalItems = totalItemsResult[0]?.totalItems || 0;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const sortCriteria: Record<string, 1 | -1> = { _id: -1 };

  const pipeline = [
    {
      $match: { status: "published" },
    },
    {
      $sort: sortCriteria,
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
  ];

  const docs = await Quiz.aggregate(pipeline);

  const data = JSON.parse(JSON.stringify(docs)) as QuizPageData[];

  return {
    props: {
      data,
      totalPages,
    },
    revalidate: currentPage === 1 ? 1 : undefined,
  };
};

export default QuizzesPage;
