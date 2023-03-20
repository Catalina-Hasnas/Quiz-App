import { updateUserPassword } from "@/services/auth";
import { FormEvent, useContext, useRef } from "react";
import classes from "./profile.module.css";
import { AuthContext } from "./_app";

function ProfilePage() {
  const { token } = useContext(AuthContext);
  const oldPassRef = useRef<HTMLInputElement>(null);
  const newPassRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const oldPass = oldPassRef.current?.value || "";
    const newPass = newPassRef.current?.value || "";

    try {
      await updateUserPassword(oldPass, newPass, token as string);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className={classes.profile}>
      <h1>Your User Profile</h1>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="new-password">New Password</label>
          <input type="password" id="new-password" ref={newPassRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="old-password">Old Password</label>
          <input type="password" id="old-password" ref={oldPassRef} />
        </div>
        <div className={classes.action}>
          <button>Change Password</button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
