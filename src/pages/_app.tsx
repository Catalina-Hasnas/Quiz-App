import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout/Layout";
import { useAuth } from "@/services/hooks/useAuth";
import { createContext } from "react";

interface IAuthContext {
  token: string | null;
  userId: string | null;
  login: (uid: string, token: string, expirationDate?: Date) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext>({
  userId: "",
  token: "",
  login: () => {},
  logout: () => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthContext.Provider>
  );
}
