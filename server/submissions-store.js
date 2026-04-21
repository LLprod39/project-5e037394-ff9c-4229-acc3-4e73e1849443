import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { calculateResult } from "./quiz-engine.js";

export const defaultDataFile = path.resolve(process.cwd(), "server", "data", "submissions.json");

let writeQueue = Promise.resolve();

async function ensureDataFile(dataFile) {
  await mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await access(dataFile);
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

async function readAllSubmissionsFromDisk(dataFile) {
  await ensureDataFile(dataFile);

  const raw = await readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.filter((item) => item && item.schemaVersion === 2) : [];
}

async function readAllSubmissions(dataFile) {
  await writeQueue.catch(() => undefined);
  return readAllSubmissionsFromDisk(dataFile);
}

async function writeAllSubmissions(submissions, dataFile) {
  await ensureDataFile(dataFile);
  await writeFile(dataFile, `${JSON.stringify(submissions, null, 2)}\n`, "utf8");
}

function sortByDateDescending(submissions) {
  return [...submissions].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
}

function upgradeSubmission(submission) {
  const result = calculateResult(submission.answers, {
    createdAt: submission.date,
    fullPrice: submission.result?.offer?.fullPrice,
  });

  return {
    ...submission,
    schemaVersion: 2,
    scheduledFor: submission.scheduledFor ?? null,
    result,
  };
}

function toPublicResult(result) {
  return {
    status: result.status,
    riskStatus: result.riskStatus,
    totalDeviations: result.totalDeviations,
    blockAssessments: result.blockAssessments,
    offer: result.offer,
    reportVersion: result.reportVersion,
    clinicalSummary: result.clinicalSummary,
    blockProfiles: result.blockProfiles.map((profile) => ({
      domain: profile.domain,
      title: profile.title,
      level: profile.level,
      summary: profile.summary,
      concerns: profile.concerns,
    })),
  };
}

export function toPublicSubmission(submission) {
  return {
    id: submission.id,
    date: submission.date,
    locale: submission.locale,
    userInfo: {
      childName: submission.userInfo.childName,
    },
    result: toPublicResult(submission.result),
  };
}

export async function listSubmissions(dataFile = defaultDataFile) {
  const submissions = await readAllSubmissions(dataFile);
  return sortByDateDescending(submissions.map(upgradeSubmission));
}

export async function getSubmissionById(id, dataFile = defaultDataFile) {
  const submissions = await readAllSubmissions(dataFile);
  const submission = submissions.find((item) => item.id === id);
  return submission ? upgradeSubmission(submission) : null;
}

export async function getPublicSubmissionByToken(id, publicToken, dataFile = defaultDataFile) {
  const submission = await getSubmissionById(id, dataFile);

  if (!submission || submission.publicToken !== publicToken) {
    return null;
  }

  return toPublicSubmission(submission);
}

export async function updateSubmissionStatus(id, updates, dataFile = defaultDataFile) {
  const task = async () => {
    const submissions = await readAllSubmissionsFromDisk(dataFile);
    const index = submissions.findIndex((submission) => submission.id === id);

    if (index === -1) {
      return null;
    }

    submissions[index] = {
      ...submissions[index],
      leadStatus: updates.leadStatus,
      scheduledFor: updates.scheduledFor ?? null,
    };

    await writeAllSubmissions(submissions, dataFile);
    return upgradeSubmission(submissions[index]);
  };

  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

export async function createSubmission(input, dataFile = defaultDataFile, options = {}) {
  const task = async () => {
    const submissions = await readAllSubmissionsFromDisk(dataFile);
    const date = new Date().toISOString();
    const submission = {
      id: randomUUID(),
      schemaVersion: 2,
      date,
      locale: input.locale,
      publicToken: randomUUID(),
      leadStatus: "new",
      scheduledFor: null,
      userInfo: input.userInfo,
      answers: input.answers,
      result: calculateResult(input.answers, {
        createdAt: date,
        fullPrice: options.fullPrice,
      }),
    };

    submissions.push(submission);
    await writeAllSubmissions(submissions, dataFile);
    return upgradeSubmission(submission);
  };

  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}
