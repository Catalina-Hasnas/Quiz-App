import MainNavigation from "./MainNavigation";

interface ILayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: ILayoutProps) {
  return (
    <>
      <MainNavigation />
      <main>{children}</main>
    </>
  );
}

export default Layout;
