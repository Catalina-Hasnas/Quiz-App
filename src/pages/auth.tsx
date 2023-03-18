import { createUser, loginUser } from "@/services/auth";
import { useAuth } from "@/services/providers/AuthProvider";
import { ILoginResponse } from "@/services/types";
import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";
import classes from "./login.module.css";

const AuthPage = () => {
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current?.value || "";
    const enteredPassword = passwordInputRef.current?.value || "";

    if (isLogin) {
      try {
        const result = await loginUser(enteredEmail, enteredPassword);
        console.log(result);

        login((result as ILoginResponse).id, (result as ILoginResponse).token);
      } catch (error) {
        console.log(error);
      }
      router.replace("/profile");
    } else {
      try {
        const result = await createUser(enteredEmail, enteredPassword);
        login((result as ILoginResponse).id, (result as ILoginResponse).token);
      } catch (error) {
        console.log(error);
      }
    }
  };

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
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthPage;
