import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/users.js";
import productRouter from "./routes/products.js";
import categoryRouter from "./routes/categories.js";
import orderRouter from "./routes/orders.js";
import ctaRouter from "./routes/cta.js";

const app = express();
app.use(cors());

app.use(express.json());
//cors

//middlewares
app.use(morgan("dev"));

dotenv.config();

// connecting db
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Db connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cta", ctaRouter);
//configuring port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
