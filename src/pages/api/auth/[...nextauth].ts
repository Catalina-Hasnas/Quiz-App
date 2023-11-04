// pages/api/auth/[...nextauth].js
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken, verifyPassword } from "@/services/auth/auth";
import User from "@/models/user";
import { connectToDatabase } from "@/services/database.service";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;

        await connectToDatabase();

        let existingUser;
        try {
          existingUser = await User.findOne({ email: email });
        } catch (err) {
          throw new Error("Couldn't log you in. " + err);
        }

        if (!existingUser) {
          throw new Error("Couldn't find a user with such an email.");
        }

        if (
          !email ||
          !email.includes("@") ||
          !password ||
          password.trim().length < 6
        ) {
          throw new Error(
            "Invalid input. Password should also be at least 7 characters long. Email should contain @."
          );
        }

        let isValidPassword = false;

        try {
          isValidPassword = await verifyPassword(
            password,
            existingUser.password
          );
        } catch (err) {
          throw new Error("Couldn't log you in." + err);
        }

        if (!isValidPassword) {
          throw new Error(
            "The password you entered is incorrect. Please check your credentials and try again."
          );
        }

        let token;

        if (existingUser) {
          try {
            token = await getToken(
              existingUser.id.toString(),
              existingUser.email
            );
          } catch (err) {
            throw new Error("Couldn't log you in." + err);
          }
        }

        const data = {
          id: existingUser.id.toString(),
          email: existingUser.email,
          name: existingUser.name,
          token: `Bearer ${token}`,
        };
        return data;
      },
    }),
  ],
  callbacks: {
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
            throw new Error("Couldn't sign you up." + err);
          }
        }
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
