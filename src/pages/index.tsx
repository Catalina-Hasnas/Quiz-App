import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Quiz App</title>
        <meta name="description" content="Quiz app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ display: "flex", flexDirection: "column" }}>
        {/* <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
        <Link href="/profile">My profile</Link>
        <Link href="/quizzes">See all quizzes</Link>
        <Link href="/myquizzes">My quizzes</Link> */}
      </main>
    </>
  );
}
