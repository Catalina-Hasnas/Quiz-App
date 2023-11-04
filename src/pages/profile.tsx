import { updateUserPassword } from "@/services/auth/auth";
import { useRouter } from "next/router";
import { FormEvent, useRef } from "react";
import { useSession } from "next-auth/react";

function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const oldPassRef = useRef<HTMLInputElement>(null);
  const newPassRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const oldPass = oldPassRef.current?.value || "";
    const newPass = newPassRef.current?.value || "";

    try {
      const updateUserResponse = await updateUserPassword(
        oldPass,
        newPass,
        session?.user?.token as string
      );
      if (updateUserResponse.ok) {
        const data = await updateUserResponse.json();
        alert(data.message);
      } else {
        const errorData = await updateUserResponse.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      router.replace("/");
      console.log(error);
    }
  };

  if (!session?.user) {
    return <div className="warning rad-shadow m-y-2 p-2 p-x-3 font-size-m text-align-center"> Please sign in in order to view this page </div>;
  }

  return (
    <section className="profile flex surface-3 rad-shadow margin-inline-auto gap-2 direction-column m-y-2 p-2 p-x-3">
      <h1>User Profile</h1>
      <form className="flex direction-column" onSubmit={submitHandler}>
        <div className="flex direction-column">
          <label htmlFor="new-password">New Password</label>
          <input type="password" id="new-password" ref={newPassRef} autoComplete="false"/>
        </div>
        <div className="flex direction-column">
          <label htmlFor="old-password">Old Password</label>
          <input type="password" id="old-password" ref={oldPassRef} autoComplete="false"/>
        </div>
        <div className="">
          <button className="btn failure line-height-2 p-05 font-weight-600">Change Password</button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
