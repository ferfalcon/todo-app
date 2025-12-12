import { apiFetch } from './client';
import type { Task, TaskStatus } from '../types/task';

function toTasksArray(raw: unknown): Task[] {
  if (Array.isArray(raw)) {
    return raw as Task[];
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Unexpected tasks list payload from API');
  }

  const obj = raw as Record<string, unknown>;

  // Try common wrapper keys: "tasks" or "items"
  const possibleKeys = ['tasks', 'items'] as const;

  for (const key of possibleKeys) {
    const value = obj[key];
    if (Array.isArray(value)) {
      return value as Task[];
    }
  }

  console.error('Unexpected tasks list payload from API:', raw);
  throw new Error('Unexpected tasks list payload from API');
}

export async function fetchAllTasks(): Promise<Task[]> {
  const raw = await apiFetch<unknown>('/tasks');
  return toTasksArray(raw);
}

export interface CreateTaskPayload {
  title: string;
}

export async function createTask(
  payload: CreateTaskPayload,
): Promise<Task> {
  return apiFetch<Task>('/tasks', {
    method: 'POST',
    json: payload,
  });
}

export interface UpdateTaskPayload {
  title?: string;
  status?: TaskStatus;
}

export async function updateTask(
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    json: payload,
  });
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch<void>(`/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function clearCompletedTasks(): Promise<number> {
  const res = await apiFetch<{ deleted: number }>('/tasks/completed', {
    method: 'DELETE',
  });

  return res.deleted;
}
