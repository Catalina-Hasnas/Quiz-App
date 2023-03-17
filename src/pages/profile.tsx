import { updateUserPassword } from "@/services/auth";
import { FormEvent, useRef } from "react";
import classes from "./profile.module.css";

function ProfilePage() {
  const oldPassRef = useRef<HTMLInputElement>(null);
  const newPassRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const oldPass = oldPassRef.current?.value || "";
    const newPass = newPassRef.current?.value || "";

    try {
      const result = await updateUserPassword(oldPass, newPass);
      console.log(result);
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
          <input type="password" id="new-password" ref={oldPassRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="old-password">Old Password</label>
          <input type="password" id="old-password" ref={newPassRef} />
        </div>
        <div className={classes.action}>
          <button>Change Password</button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
