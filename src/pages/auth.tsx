import { createUser, loginUser } from "@/services/auth/auth";
import { useRouter } from "next/router";
import { FormEvent, useContext, useRef, useState } from "react";
import classes from "./login.module.css";
import { AuthContext } from "./_app";

const AuthPage = () => {
  const { addUserInfoInLocalStorage } = useContext(AuthContext);
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
        const loginResponse = await loginUser(enteredEmail, enteredPassword);
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          addUserInfoInLocalStorage(data.data.id, data.data.token);
          router.replace("/profile");
        } else {
          const errorData = await loginResponse.json();
          throw new Error(errorData.error.message);
        }
      } catch (error) {
        router.replace("/");
        console.error(error);
      }
    } else {
      try {
        const signUpResponse = await createUser(enteredEmail, enteredPassword);
        if (signUpResponse.ok) {
          const data = await signUpResponse.json();
          addUserInfoInLocalStorage(data.data.id, data.data.token);
          router.replace("/profile");
        } else {
          const errorData = await signUpResponse.json();
          throw new Error(errorData.error.message);
        }
        router.replace("/profile");
      } catch (error) {
        router.replace("/");
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
