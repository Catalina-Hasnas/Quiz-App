import { useRouter } from "next/router";
import { useState } from "react";
import classes from "./login.module.css";

const AuthPage = () => {
  const router = useRouter();
  const handleLoginButtonClick = () => {
    router.push("/");
  };

  const [isLogin, setIsLogin] = useState(true);

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input type="password" id="password" required />
        </div>
        <div className={classes.actions}>
          <button onClick={handleLoginButtonClick}>
            {isLogin ? "Login" : "Create Account"}
          </button>
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
