import { AuthContext } from "@/pages/_app";
import Link from "next/link";
import { useContext } from "react";

import classes from "./MainNavigation.module.css";

const MainNavigation = () => {
  const { removeUserInfoFromLocalStorage, token } = useContext(AuthContext);
  return (
    <header className={classes.header}>
      <Link href="/">Home</Link>
      <span> </span>
      <nav>
        <ul>
          {!token && (
            <li>
              <Link href="/auth">Login</Link>
            </li>
          )}
          {token && (
            <>
              <li>
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <button onClick={() => removeUserInfoFromLocalStorage()}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
