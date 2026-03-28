import { existsSync } from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { createSubmission, defaultDataFile, getSubmissionById, listSubmissions } from "./submissions-store.js";
import { parseSubmissionInput, SubmissionValidationError } from "./quiz-engine.js";

export function createApp(options = {}) {
  const dataFile = options.dataFile || defaultDataFile;
  const distDir = options.distDir || path.resolve(process.cwd(), "dist");
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/submissions", async (_request, response, next) => {
    try {
      const submissions = await listSubmissions(dataFile);
      response.json(submissions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/submissions/:id", async (request, response, next) => {
    try {
      const submission = await getSubmissionById(request.params.id, dataFile);

      if (!submission) {
        response.status(404).json({ message: "Анкета не найдена." });
        return;
      }

      response.json(submission);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/submissions", async (request, response, next) => {
    try {
      const input = parseSubmissionInput(request.body);
      const submission = await createSubmission(input, dataFile);
      response.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  });

  if (existsSync(distDir)) {
    app.use(express.static(distDir));

    app.get("*", (request, response, next) => {
      if (request.path.startsWith("/api")) {
        next();
        return;
      }

      response.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.use((error, _request, response, _next) => {
    if (error instanceof SubmissionValidationError) {
      response.status(400).json({
        message: error.message,
        issues: error.issues,
      });
      return;
    }

    if (error instanceof SyntaxError) {
      response.status(400).json({
        message: "Некорректный JSON в теле запроса.",
      });
      return;
    }

    console.error(error);
    response.status(500).json({
      message: "Внутренняя ошибка сервера.",
    });
  });

  return app;
}
