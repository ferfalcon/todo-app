import { prisma } from '../db/client';
import type { Task, TaskStatus, TaskId, UserId } from '../domain/models';
import type { Task as TaskRecord } from '../generated/prisma/client';

function mapTask(record: TaskRecord): Task {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    status: record.status,
    order: record.order,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export const tasksRepository = {
  async findAllByUser(userId: UserId, status?: TaskStatus): Promise<Task[]> {
    const records = await prisma.task.findMany({
      where: { 
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { order: 'asc'},
    });

    return records.map(mapTask);
  },

  async createForUser(userId: UserId, title: string): Promise<Task> {
    const maxOrder = await prisma.task.aggregate({
      where: { userId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const record = await prisma.task.create({
      data: {
        userId,
        title,
        status: 'active',
        order: nextOrder,
      },
    });

    return mapTask(record);
  },

  async updateForUser(
    userId: UserId,
    taskId: TaskId,
    changes: Partial<Pick<Task, 'title' | 'status'>>,
  ): Promise<Task | null> {
    const data: { title?: string; status? : TaskStatus} = {};

    if (typeof changes.title === 'string') {
      data.title = changes.title;
    }
    if (typeof changes.status === 'string') {
      data.status = changes.status;
    }

    if (Object.keys(data).length === 0) {
      return null;
    }

    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId},
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data,
    });

    return mapTask(updated);
  },

  async deleteForUser(userId: UserId, taskId: TaskId): Promise<boolean> {
    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId },
    });

    return result.count > 0;
  },
};