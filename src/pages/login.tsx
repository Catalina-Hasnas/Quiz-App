import { useRouter } from "next/router";

const LoginPage = () => {
  const router = useRouter();
  const handleLoginButtonClick = () => {
    router.push("/");
  };
  return (
    <div>
      Login page{" "}
      <button onClick={handleLoginButtonClick} type="submit">
        Log in
      </button>
    </div>
  );
};

export default LoginPage;
