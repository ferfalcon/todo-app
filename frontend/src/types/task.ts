export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
}
