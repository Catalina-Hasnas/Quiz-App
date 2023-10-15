// pages/api/auth/[...nextauth].js
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createUser } from "@/services/auth/auth";
import User from "@/models/user";
import { connectToDatabase } from "@/services/database.service";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        console.log("credentials");
        console.log(credentials);
        const loginResponse = await fetch(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await loginResponse.json();
        if (data && data.error == null) {
          return data.data;
        } else {
          const errorData = await loginResponse.json();
          throw new Error(errorData.error.message);
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        await connectToDatabase();
        let existingUser;
        try {
          existingUser = await User.findOne({ email: user.email });
        } catch (err) {
          console.error(err);
        }

        if (!existingUser) {
          const createdUser = new User({
            email: user.email ?? "",
            password: "",
            name: user.name ?? "",
          });
          try {
            await createdUser.save();
          } catch (err) {
            console.error({
              data: null,
              error: {
                message: "Couldn't sign you up." + err,
              },
            });
          }
        }
        token.user = { ...user };
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
