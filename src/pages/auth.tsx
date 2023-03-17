import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";
import classes from "./login.module.css";

const createUser = async (email: string, password: string) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong!");
  }

  return data;
};

const AuthPage = () => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  function switchAuthModeHandler() {
    setIsLogin(!isLogin);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const enteredEmail = emailInputRef.current?.value || "";
    const enteredPassword = passwordInputRef.current?.value || "";

    if (isLogin) {
      // set auth state
      router.replace("/profile");
    } else {
      try {
        const result = await createUser(enteredEmail, enteredPassword);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={(event) => submitHandler(event)}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          <button>{isLogin ? "Login" : "Create Account"}</button>
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthPage;
