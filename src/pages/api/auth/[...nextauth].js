// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/db"; // Your database connection function

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add other providers if needed
  ],
  callbacks: {
    async signIn(user, account, profile) {
      await connectToDatabase();

      let existingUser;
      try {
        existingUser = await User.findOne({ email: email });
      } catch (err) {
        return res.status(500).json({
          data: null,
          error: {
            message: "Couldn't log you in." + err,
          },
        });
      }
      if (!existingUser) {
        return res.status(404).json({
          data: null,
          error: {
            message: "Couldn't find a user with such an email.",
          },
        });
      }

      let isValidPassword = false;

      try {
        isValidPassword = await verifyPassword(
          password,
          existingUser?.password || ""
        );
      } catch (err) {
        return res.status(500).json({
          data: null,
          error: {
            message: "Couldn't log you in." + err,
          },
        });
      }

      if (!isValidPassword) {
        return res.status(401).json({
          data: null,
          error: {
            message:
              "The password you entered is incorrect. Please check your credentials and try again.",
          },
        });
      }

      let token;

      if (existingUser) {
        try {
          token = await getToken(
            existingUser.id.toString(),
            existingUser.email
          );
        } catch (err) {
          return res.status(500).json({
            data: null,
            error: {
              message: "Couldn't log you in." + err,
            },
          });
        }
      }
    },
  },
  // Other config options
});
