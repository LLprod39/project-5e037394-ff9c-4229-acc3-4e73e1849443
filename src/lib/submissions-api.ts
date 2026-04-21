import {
  AdminSession,
  CreateSubmissionResponse,
  PublicSubmission,
  Submission,
  SubmissionInput,
  LeadStatus,
} from "@/types/quiz";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

interface ApiErrorPayload {
  message?: string;
  issues?: string[];
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
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
  return requestJson<CreateSubmissionResponse>("/api/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPublicSubmission(id: string, token: string) {
  return requestJson<PublicSubmission>(
    `/api/public-submissions/${id}?token=${encodeURIComponent(token)}`
  );
}

export function loginAdmin(username: string, password: string) {
  return requestJson<AdminSession>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutAdmin() {
  return requestJson<{ success: true }>("/api/admin/logout", {
    method: "POST",
  });
}

export function getAdminSession() {
  return requestJson<AdminSession>("/api/admin/me");
}

export function getSubmissions() {
  return requestJson<Submission[]>("/api/submissions");
}

export function getSubmissionById(id: string) {
  return requestJson<Submission>(`/api/submissions/${id}`);
}

export function updateSubmissionStatus(
  id: string,
  payload: { leadStatus: LeadStatus; scheduledFor?: string | null }
) {
  return requestJson<Submission>(`/api/submissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
