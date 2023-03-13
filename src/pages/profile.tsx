import ProfileForm from "@/components/Profile/ProfileForm";
import classes from "./profile.module.css";

function ProfilePage() {
  // Redirect away if NOT auth

  return (
    <section className={classes.profile}>
      <h1>Your User Profile</h1>
      <ProfileForm />
    </section>
  );
}

export default ProfilePage;
