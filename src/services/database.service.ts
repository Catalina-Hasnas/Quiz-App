import mongoose from "mongoose";

export async function connectToDatabase() {
  const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@quiz-app.vwkgw1g.mongodb.net/?retryWrites=true&w=majority`;
  mongoose
    .connect(url)
    .then(() => console.log("Connected"))
    .catch((error) => console.log(error));
}
