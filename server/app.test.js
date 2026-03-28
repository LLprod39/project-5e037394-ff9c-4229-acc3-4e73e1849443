import { mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const validPayload = {
  userInfo: {
    childName: "Артем",
    childAge: "2 года 4 месяца",
    parentName: "Елена",
    phone: "+7 (999) 123-45-67",
    consentGiven: true,
  },
  answers: {
    pregnancy_course: ["toxicosis", "stress"],
    hypoxia: ["yes"],
    birth_type: ["cesarean_emergency"],
    head_holding: ["5_6m"],
    sitting: ["10_12m"],
    walking: ["15_18m"],
    first_words: ["18_24m"],
    eye_contact: ["sometimes"],
    social_interaction: ["observes"],
  },
};

let activeServer = null;
let tempDirectory = null;

async function startServer() {
  tempDirectory = await mkdtemp(path.join(os.tmpdir(), "quiz-api-"));
  const dataFile = path.join(tempDirectory, "submissions.json");
  const app = createApp({
    dataFile,
    distDir: path.join(tempDirectory, "missing-dist"),
  });

  activeServer = http.createServer(app);

  await new Promise((resolve) => {
    activeServer.listen(0, "127.0.0.1", resolve);
  });

  const address = activeServer.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

afterEach(async () => {
  if (activeServer) {
    await new Promise((resolve, reject) => {
      activeServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  activeServer = null;

  if (tempDirectory) {
    await rm(tempDirectory, { recursive: true, force: true });
  }

  tempDirectory = null;
});

describe("submission API", () => {
  it("creates a submission and returns it from list and detail endpoints", async () => {
    const { baseUrl } = await startServer();

    const createResponse = await fetch(`${baseUrl}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayload),
    });

    expect(createResponse.status).toBe(201);

    const created = await createResponse.json();
    expect(created.userInfo.childName).toBe(validPayload.userInfo.childName);
    expect(created.result.level).toBe("diagnosis");

    const listResponse = await fetch(`${baseUrl}/api/submissions`);
    expect(listResponse.status).toBe(200);

    const list = await listResponse.json();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);

    const detailResponse = await fetch(`${baseUrl}/api/submissions/${created.id}`);
    expect(detailResponse.status).toBe(200);

    const detail = await detailResponse.json();
    expect(detail.id).toBe(created.id);
    expect(detail.result.totalScore).toBeGreaterThan(0);
  });

  it("rejects incomplete submissions with a validation error", async () => {
    const { baseUrl } = await startServer();

    const response = await fetch(`${baseUrl}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInfo: {
          ...validPayload.userInfo,
          consentGiven: false,
        },
        answers: {
          pregnancy_course: ["toxicosis"],
        },
      }),
    });

    expect(response.status).toBe(400);

    const payload = await response.json();
    expect(payload.message).toBe("Некорректные данные анкеты.");
    expect(payload.issues.length).toBeGreaterThan(0);
  });
});
