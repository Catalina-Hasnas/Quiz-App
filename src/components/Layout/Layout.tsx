import Head from "next/head";
import MainNavigation from "./MainNavigation";

interface ILayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
  return (
    <div className="root">
      <Head>
        <title>Quiz App</title>
        <meta name="description" content="Quiz app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainNavigation />
      <main className="margin-inline-auto">{children}</main>
    </div>
  );
};

export default Layout;
