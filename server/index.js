import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const defaultOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];
const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pomodorofy-auth" });
});

app.use("/auth", authRoutes);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message =
    status >= 500 ? "Something went wrong on the server." : error.message;

  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Pomodorofy server listening on http://localhost:${port}`);
});
