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

  return Array.isArray(parsed) ? parsed : [];
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

export async function listSubmissions(dataFile = defaultDataFile) {
  const submissions = await readAllSubmissions(dataFile);
  return sortByDateDescending(submissions);
}

export async function getSubmissionById(id, dataFile = defaultDataFile) {
  const submissions = await readAllSubmissions(dataFile);
  return submissions.find((submission) => submission.id === id);
}

export async function createSubmission(input, dataFile = defaultDataFile) {
  const task = async () => {
    const submissions = await readAllSubmissionsFromDisk(dataFile);
    const submission = {
      id: randomUUID(),
      date: new Date().toISOString(),
      userInfo: input.userInfo,
      answers: input.answers,
      result: calculateResult(input.answers),
    };

    submissions.push(submission);
    await writeAllSubmissions(submissions, dataFile);
    return submission;
  };

  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}
