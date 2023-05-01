import { FormEvent, useContext, useRef } from "react";
import { AuthContext } from "../_app";
import router from "next/router";

const CreateQuiz = () => {
  const { token } = useContext(AuthContext);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await fetch("/api/quizzes/create", {
        method: "POST",
        body: JSON.stringify({
          title: titleInputRef?.current?.value,
          description: descriptionInputRef?.current?.value,
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: token as string,
        },
      });
      if (result.ok) {
        const data = await result.json();
        router.replace(`/edit_quiz/${data.data.quiz_id}`);
      } else {
        const errorData = await result.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      router.replace("/edit_quiz");
    }
  };

  return (
    <form
      className="flex direction-column font-size-m m-y-2"
      onSubmit={(event) => handleSubmit(event)}
    >
      <label className="font-size-l" htmlFor="title">
        Title
      </label>
      <input
        className="align-self-baseline"
        name="title"
        id="title"
        type="text"
        ref={titleInputRef}
        required
      />
      <label className="font-size-l" htmlFor="title">
        Description
      </label>
      <textarea
        name="description"
        id="description"
        ref={descriptionInputRef}
        required
      />
      <button
        className="align-self-baseline line-height-2 p-x-2 m-y-2 btn submit"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
};

export default CreateQuiz;
