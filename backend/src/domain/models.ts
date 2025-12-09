export type UserId = string;
export type TaskId = string;

export type TaskStatus = 'active' | 'completed';

export interface User {
  id: UserId;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: TaskId;
  userId: UserId;
  title: string;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
