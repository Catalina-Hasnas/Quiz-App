import { hash, compare } from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

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

  return response;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const updateUserPassword = async (
  oldPassword: string,
  newPassword: string,
  token: string
) => {
  const response = await fetch("/api/auth/update", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  });

  return response;
};
