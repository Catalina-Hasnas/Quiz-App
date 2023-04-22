import { FormEvent, useContext, useRef } from "react";
import { AuthContext } from "../_app";
import router from "next/router";

const CreateQuiz = () => {
  const { token } = useContext(AuthContext);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await fetch("/api/createquiz", {
        method: "POST",
        body: JSON.stringify({ title: titleInputRef?.current?.value }),
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
    <form onSubmit={(event) => handleSubmit(event)}>
      <input type="text" ref={titleInputRef} />
      <button type="submit"> SUBMIT </button>
    </form>
  );
};

export default CreateQuiz;
