import Quiz, { QuizModelWithId } from "@/models/quiz";
import { connectToDatabase } from "@/services/database.service";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { QuestionModel } from "@/models/question";
import QuestionForm from "@/components/CreateQuiz/Forms/QuestionForm";
import { useContext, useState } from "react";
import Sidebar from "@/components/CreateQuiz/Sidebar/Sidebar";
import { AuthContext } from "@/pages/_app";

interface QuizPageProps {
  data: QuizModelWithId;
}

const QuizPage = ({ data }: QuizPageProps) => {
  const router = useRouter();

  const { token } = useContext(AuthContext);

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    data?.questions?.[0]._id || null
  );

  const [responseId, setResponseId] = useState<string | null>(null);

  const currentQuestion = data?.questions?.find(
    (question) => question._id === currentQuestionId
  );

  const initialValues: QuestionModel = {
    title: currentQuestion ? currentQuestion.title : "",
    type: currentQuestion ? currentQuestion.type : "open",
    options: currentQuestion ? currentQuestion.options : [],
  };

  const handleSubmit = async (values: QuestionModel) => {
    if (!responseId && token) {
      try {
        const result = await fetch(
          `/api/response_quiz/${router.query.quizId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: token as string,
            },
            body: JSON.stringify({ ...values, _id: currentQuestionId }),
          }
        );
        if (result.ok) {
          const data = await result.json();
          setResponseId(data.data.response_id);
        } else {
          const errorData = await result.json();
          throw new Error(errorData.error.message);
        }
      } catch (error) {
        console.log(error);
      }
    }

    // edit response
    if (responseId && token) {
      try {
        const result = await fetch(
          `/api/response_quiz/${router.query.quizId}/response/${responseId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              authorization: token as string,
            },
            body: JSON.stringify({ ...values, _id: currentQuestionId }),
          }
        );
        if (result.ok) {
          const data = await result.json();
        } else {
          const errorData = await result.json();
          throw new Error(errorData.error.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex direction-row grow height-100">
      <QuestionForm
        initialValues={initialValues}
        handleSubmit={handleSubmit}
        isResponse
      />
      <div className="sidebar surface-4 rad-shadow p-2 font-size-m">
        <Sidebar
          questions={data?.questions || []}
          setCurrentQuestionId={setCurrentQuestionId}
          currentQuestionId={currentQuestionId}
        />
      </div>
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

  if (!quizData) {
    return {
      notFound: true, // Return a 404 page
    };
  }

  const data = JSON.stringify(quizData);

  const quizWithoutAnswers = { ...JSON.parse(data) };

  quizWithoutAnswers.questions.forEach((question: QuestionModel) => {
    question.options.forEach((option) => {
      option.isRightAnswer = false;
    });
  });

  return {
    props: {
      data: quizWithoutAnswers,
    },
  };
}

export default QuizPage;
