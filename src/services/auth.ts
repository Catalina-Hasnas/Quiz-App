import { hash, compare } from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { HttpError, ILoginResponse, IUser } from "./types";

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  const isValid = await compare(password, hashedPassword);
  return isValid;
};

export const generateToken = async (user: IUser) => {
  const token = await jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: "3h",
    }
  );
  return token;
};

export const getToken = async (id: string, email: string) => {
  const token = await jwt.sign(
    { id: id, email: email },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: "3h" }
  );
  return token;
};

export const verifyToken = async (token: string) => {
  const userToken = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  );
  return userToken;
};

export const createUser = async (email: string, password: string) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong!");
  }

  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: ILoginResponse | HttpError = await response.json();

  if (!response.ok) {
    console.log((data as HttpError).message);
  }

  return data;
};

export const updateUserPassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const response = await fetch("/api/auth/update", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
    headers: {
      "Content-Type": "application/json",
      authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTFiN2UyNmU2YjNhZDYxMjk2OTM2ZiIsImVtYWlsIjoicGV0cnVAZW1haWwuY29tIiwiaWF0IjoxNjc5MDc0MTEwLCJleHAiOjE2NzkwODQ5MTB9.ygTUYaQ5Ja3-q59ekw0n55NHVwTA2i0Shh7rTma0z-I",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong!");
  }

  return data;
};
