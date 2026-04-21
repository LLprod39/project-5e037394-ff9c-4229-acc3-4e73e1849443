import { existsSync } from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import express from "express";
import cors from "cors";
import {
  createSubmission,
  defaultDataFile,
  getPublicSubmissionByToken,
  getSubmissionById,
  listSubmissions,
  toPublicSubmission,
  updateSubmissionStatus,
} from "./submissions-store.js";
import { parseSubmissionInput, SubmissionValidationError } from "./quiz-engine.js";

const SESSION_COOKIE = "umay_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function createCookieHeader(name, value, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearCookieHeader(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      })
  );
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "umay-kids-preview-secret";
}

function signValue(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function encodeSession(username, secret) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    }),
    "utf8"
  ).toString("base64url");

  const signature = signValue(payload, secret);
  return `${payload}.${signature}`;
}

function decodeSession(token, secret) {
  if (!token) return null;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(payload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!parsed?.username || !parsed?.exp || Date.now() > parsed.exp) {
      return null;
    }

    return {
      username: parsed.username,
      expiresAt: parsed.exp,
    };
  } catch {
    return null;
  }
}

function getSession(request, secret) {
  const cookies = parseCookies(request.headers.cookie);
  return decodeSession(cookies[SESSION_COOKIE], secret);
}

function requireAdmin(secret) {
  return (request, response, next) => {
    const session = getSession(request, secret);

    if (!session) {
      response.status(401).json({ message: "Требуется вход в админку." });
      return;
    }

    request.adminSession = session;
    next();
  };
}

function validateStatusUpdate(payload) {
  const allowedStatuses = new Set(["new", "called", "scheduled", "completed", "declined"]);
  const leadStatus = payload?.leadStatus;
  const scheduledFor = payload?.scheduledFor ?? null;

  if (!allowedStatuses.has(leadStatus)) {
    return {
      ok: false,
      message: "Некорректный статус клиента.",
    };
  }

  if (leadStatus === "scheduled" && (!scheduledFor || Number.isNaN(Date.parse(scheduledFor)))) {
    return {
      ok: false,
      message: "Для статуса записи укажите дату и время.",
    };
  }

  return {
    ok: true,
    leadStatus,
    scheduledFor: leadStatus === "scheduled" ? scheduledFor : null,
  };
}

export function createApp(options = {}) {
  const dataFile = options.dataFile || defaultDataFile;
  const distDir = options.distDir || path.resolve(process.cwd(), "dist");
  const fullPrice = Number(options.fullPrice || process.env.DIAGNOSTIC_FULL_PRICE || 30000);
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const sessionSecret = options.sessionSecret || getSessionSecret();
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.post("/api/admin/login", (request, response) => {
    const username = String(request.body?.username || "").trim();
    const password = String(request.body?.password || "");

    if (username !== adminUsername || password !== adminPassword) {
      response.status(401).json({ message: "Неверный логин или пароль." });
      return;
    }

    const sessionToken = encodeSession(username, sessionSecret);
    response.setHeader(
      "Set-Cookie",
      createCookieHeader(SESSION_COOKIE, sessionToken, SESSION_MAX_AGE_SECONDS)
    );
    response.json({
      authenticated: true,
      username,
    });
  });

  app.post("/api/admin/logout", (_request, response) => {
    response.setHeader("Set-Cookie", clearCookieHeader(SESSION_COOKIE));
    response.json({ success: true });
  });

  app.get("/api/admin/me", (request, response) => {
    const session = getSession(request, sessionSecret);

    if (!session) {
      response.status(401).json({ message: "Сессия не найдена." });
      return;
    }

    response.json({
      authenticated: true,
      username: session.username,
    });
  });

  app.get("/api/public-submissions/:id", async (request, response, next) => {
    try {
      const submission = await getPublicSubmissionByToken(
        request.params.id,
        String(request.query.token || ""),
        dataFile
      );

      if (!submission) {
        response.status(404).json({ message: "Результат не найден." });
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
      const submission = await createSubmission(input, dataFile, { fullPrice });

      response.status(201).json({
        ...toPublicSubmission(submission),
        publicToken: submission.publicToken,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/submissions", requireAdmin(sessionSecret), async (_request, response, next) => {
    try {
      const submissions = await listSubmissions(dataFile);
      response.json(submissions);
    } catch (error) {
      next(error);
    }
  });

  app.get(
    "/api/submissions/:id",
    requireAdmin(sessionSecret),
    async (request, response, next) => {
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
    }
  );

  app.patch(
    "/api/submissions/:id/status",
    requireAdmin(sessionSecret),
    async (request, response, next) => {
      try {
        const validation = validateStatusUpdate(request.body);

        if (!validation.ok) {
          response.status(400).json({ message: validation.message });
          return;
        }

        const submission = await updateSubmissionStatus(
          request.params.id,
          {
            leadStatus: validation.leadStatus,
            scheduledFor: validation.scheduledFor,
          },
          dataFile
        );

        if (!submission) {
          response.status(404).json({ message: "Анкета не найдена." });
          return;
        }

        response.json(submission);
      } catch (error) {
        next(error);
      }
    }
  );

  if (distDir && existsSync(distDir)) {
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
