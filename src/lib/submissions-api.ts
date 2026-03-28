import { Submission, SubmissionInput } from "@/types/quiz";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

interface ApiErrorPayload {
  message?: string;
  issues?: string[];
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    const details = payload?.issues?.length ? ` ${payload.issues.join(" ")}` : "";
    throw new Error((payload?.message || "Запрос к серверу завершился с ошибкой.") + details);
  }

  return response.json() as Promise<T>;
}

export function createSubmission(payload: SubmissionInput) {
  return requestJson<Submission>("/api/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSubmissions() {
  return requestJson<Submission[]>("/api/submissions");
}

export function getSubmissionById(id: string) {
  return requestJson<Submission>(`/api/submissions/${id}`);
}
