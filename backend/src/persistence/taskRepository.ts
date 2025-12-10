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

  async updateForUser(userId: UserId, taskId: TaskId, changes: Partial<Pick<Task, 'title' | 'status'>>): Promise<Task | null> {
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

  async clearCompletedForUser(userId: UserId): Promise<number> {
    const result = await prisma.task.deleteMany({
      where: {
        userId,
        status: 'completed',
      },
    });

    return result.count;
  },

  async reorderForUser(userId: UserId, orderedIds: TaskId[]): Promise<Task[] | null> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    if (tasks.length !== orderedIds.length) {
      return null;
    }

    const existingIds = new Set(tasks.map((task) => task.id));
    const seen = new Set<string>();

    for (const id of orderedIds) {
      if (!existingIds.has(id)) {
        return null;
      }

      if (seen.has(id)) {
        return null;
      }

      seen.add(id);
    }

    const updates = orderedIds.map((id, index) => 
      prisma.task.update({ 
        where: { id },
        data: { order: index },
      })
    );

    const updatedRecords = await prisma.$transaction(updates);

    return updatedRecords.map(mapTask);
  },
};