import { AuthContext } from "@/pages/_app";
import Link from "next/link";
import { useContext, useState } from "react";

const MainNavigation = () => {
  const { removeUserInfoFromLocalStorage, token } = useContext(AuthContext);

  const [isOpen, setOpen] = useState(false);

  return (
    <header className="header rad-shadow justify-space-around font-size-m font-weight-600 p-1">
      <button
        className="p-1 btn-link text-1 menu-button"
        onClick={() => setOpen(!isOpen)}
      >
        <i className="gg-menu-left-alt"></i>
      </button>
      <nav className="margin-inline-auto" data-visible={`${isOpen}`}>
        <ul className="flex justify-space-around gap-2 no-bullet display-block menu-items">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/quizzes/page/1">Quizzes</Link>
          </li>
          {!token && (
            <li>
              <Link href="/auth">Login</Link>
            </li>
          )}
          <li>
            <Link href="/edit_quiz">Create quiz</Link>
          </li>
          {token && (
            <>
              <li>
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <button
                  className="font-size-m font-weight-600 text-1 btn-link  "
                  onClick={() => removeUserInfoFromLocalStorage()}
                >
                  Logout
                </button>
              </li>
              <li>
                <Link href="/my_quizzes">My Quizzes</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
