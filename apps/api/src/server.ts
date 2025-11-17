import "dotenv/config";
import cors from "cors";
import express from "express";
import type { ErrorRequestHandler } from "express";
import { authenticateRequest } from "./middleware/auth";
import authRouter from "./routes/auth";
import locationsRouter from "./routes/locations";
import requestsRouter from "./routes/requests";
import runnerRouter from "./routes/runner";
import usersRouter from "./routes/users";

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateRequest);

app.get("/health", (_req, res) => {
  res.json({
    service: "CampusDash API",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRouter);
app.use("/locations", locationsRouter);
app.use("/requests", requestsRouter);
app.use("/runner", runnerRouter);
app.use("/users", usersRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error" });
};

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API ready on port ${port}`);
});
