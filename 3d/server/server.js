import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ApiError } from "./lib/api-error.js";
import {
  getHealthPayload,
  getMessagesPayload,
  getPortfolioPayload,
  submitContactPayload,
} from "./lib/api-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:4173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const distPath = path.resolve(__dirname, "..", "dist");

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        process.env.NODE_ENV === "production" ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/api/health", async (_request, response, next) => {
  try {
    response.json(await getHealthPayload());
  } catch (error) {
    next(error);
  }
});

app.get("/api/portfolio", async (_request, response, next) => {
  try {
    response.json(await getPortfolioPayload());
  } catch (error) {
    next(error);
  }
});

app.get("/api/messages", async (_request, response, next) => {
  try {
    response.json(await getMessagesPayload());
  } catch (error) {
    next(error);
  }
});

app.post("/api/contact", async (request, response, next) => {
  try {
    response.status(201).json(await submitContactPayload(request.body ?? {}));
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, next) => {
  void next;

  if (error instanceof ApiError) {
    response.status(error.status).json({
      message: error.message,
      ...(Object.keys(error.details).length > 0 ? { errors: error.details } : {}),
    });
    return;
  }

  response.status(500).json({
    message: error.message || "Something went wrong on the server.",
  });
});

try {
  await fs.access(distPath);
  app.use(express.static(distPath));
  app.get("/{*path}", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
} catch {
  app.get("/", (_request, response) => {
    response.json({
      message:
        "Portfolio backend is running. Start the Vite client on http://localhost:5173 for the frontend.",
    });
  });
}

app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
