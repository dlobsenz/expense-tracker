import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import expensesRouter from "./routes/expenses.js";
import authRouter from "./routes/auth.js";

console.log("🚀 Starting Expense Tracker Server...");
console.log("📁 Using Neon PostgreSQL database");
console.log("🌐 Cloud database for persistent storage");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/expenses", expensesRouter);

app.get("/", (req, res) => {
  res.send("Expense Tracker API is running.");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
