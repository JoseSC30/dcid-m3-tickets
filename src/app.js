import express from "express";
import cors from "cors";
import "dotenv/config";
import { run, db } from "./config/database.js";
import { log } from "./utils/logger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import ticketRouter from "./routes/ticket.routes.js";
export const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/health", async (req, res) => {
  try {
    if (db) await run("SELECT 1");
    res.json({ status: "ok", service: process.env.SERVICE });
  } catch {
    res
      .status(503)
      .json({ status: "unavailable", service: process.env.SERVICE });
  }
});
app.use((req, res, next) => {
  log("info", `${req.method} ${req.path}`);
  next();
});
app.use(ticketRouter);
app.use(errorHandler);
