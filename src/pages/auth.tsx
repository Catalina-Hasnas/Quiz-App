import { createUser, loginUser } from "@/services/auth/auth";
import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";

const AuthPage = () => {
  const { data: session } = useSession();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    // TODO: cleanup and make register only
    event.preventDefault();

    const enteredEmail = emailInputRef.current?.value || "";
    const enteredPassword = passwordInputRef.current?.value || "";

    if (isLogin) {
      try {
        const loginResponse = await loginUser(enteredEmail, enteredPassword);
        if (loginResponse.ok) {
          const data = await loginResponse.json();
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
        const enteredName = nameInputRef.current?.value || "";
        const signUpResponse = await createUser(
          enteredEmail,
          enteredPassword,
          enteredName
        );
        if (signUpResponse.ok) {
          const data = await signUpResponse.json();
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

  const signInWithNext = () => {
    const result = signIn();
  };

  return (
    <section className="auth flex text-align-center direction-column gap-2 align-items-center surface-3 m-y-2 p-2 text-1 rad-shadow margin-inline-auto width-max-content">
      {session && session.user ? (
        <>
          <h1 className="align-self-stretch">Logged-in</h1>
          <button className="btn m-y-1 failure p-1 p-x-2 line-height-2  font-size-m" onClick={() => signOut()}>Log out</button>
        </>
      ) : (
        <>
          <h1 className="align-self-stretch">Logged OUT</h1>
          <button className="btn m-y-1 success p-1 p-x-2 line-height-2  font-size-m" onClick={() => signInWithNext()}>Log in</button>
        </>
      )}
      <form
        className="flex direction-column gap-2"
        onSubmit={(event) => submitHandler(event)}
      >
        {!isLogin && (
          <>
            <div className="flex direction-column input-group">
              <label className="align-self-baseline" htmlFor="name">
                Name
              </label>
              <input type="text" id="name" required ref={nameInputRef} />
            </div>

            <div className="flex direction-column input-group">
              <label className="align-self-baseline" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                ref={emailInputRef}
                autoComplete="off"
              />
            </div>
            <div className="flex direction-column input-group">
              <label className="align-self-baseline" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                ref={passwordInputRef}
                autoComplete="off"
              />
            </div>
          </>
        )}
        <div className={"flex direction-column actions"}>
          {!isLogin && (
            <button className="btn m-y-1 success line-height-2  font-size-m">
              {isLogin ? "Login" : "Create Account"}
            </button>
          )}
          <button
            type="button"
            className="btn-link toggle m-y-2"
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
