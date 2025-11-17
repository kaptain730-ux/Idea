const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
};

export type RequestEvent = {
  id: string;
  status: string;
  timestamp: string;
};

export type RequestRecord = {
  id: string;
  taskType: string;
  status: string;
  preferredTime?: string | null;
  instructions?: string | null;
  estimatedCost?: string | null;
  actualCost?: string | null;
  createdAt: string;
  pickupLocation: Location;
  dropLocation: Location;
  requester: { id: string; name: string | null } | null;
  runner: { id: string; name: string | null } | null;
  events?: RequestEvent[];
};

export type UserSummary = {
  id: string;
  name: string | null;
  role: string;
  email: string | null;
};

export type CreateRequestPayload = {
  requesterId: string;
  pickupLocationId: string;
  dropLocationId: string;
  taskType: string;
  preferredTime?: string;
  instructions?: string;
  estimatedCost?: number;
};

export type RunnerTasksResponse = {
  available: RequestRecord[];
  assigned: RequestRecord[];
};

export type RunnerSummary = {
  completedCount: number;
  totalEarnings: string | number;
  weeklyEarnings: string | number;
  recentPayments: Array<{
    id: string;
    amount: string | number;
    createdAt: string;
    taskType: string;
  }>;
};

async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to reach CampusDash API");
  }

  return response.json() as Promise<T>;
}

export async function fetchRequests(status?: string) {
  const query = status ? `?status=${status}` : "";
  const { data } = await fetchFromApi<{ data: RequestRecord[] }>(`/requests${query}`);
  return data;
}

export async function fetchRequest(id: string) {
  const data = await fetchFromApi<RequestRecord>(`/requests/${id}`);
  return data;
}

export async function fetchLocations() {
  const { data } = await fetchFromApi<{ data: Location[] }>("/locations");
  return data;
}

export async function createRequest(payload: CreateRequestPayload) {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to create request");
  }

  return response.json() as Promise<RequestRecord>;
}

export async function fetchUsers() {
  const { data } = await fetchFromApi<{ data: UserSummary[] }>("/users");
  return data;
}

export async function fetchRunnerTasks(runnerId: string) {
  const data = await fetchFromApi<RunnerTasksResponse>(`/runner/tasks?runnerId=${runnerId}`);
  return data;
}

export async function fetchRunnerSummary(runnerId: string) {
  const data = await fetchFromApi<RunnerSummary>(`/runner/summary?runnerId=${runnerId}`);
  return data;
}

export async function acceptRunnerTask(taskId: string, runnerId: string) {
  const response = await fetch(`/api/runner/tasks/${taskId}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runnerId })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to accept task");
  }

  return response.json() as Promise<RequestRecord>;
}

export async function completeRunnerTask(taskId: string, runnerId: string, actualCost?: number) {
  const response = await fetch(`/api/runner/tasks/${taskId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runnerId, actualCost })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to complete task");
  }

  return response.json() as Promise<RequestRecord>;
}

export const REQUEST_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
] as const;
