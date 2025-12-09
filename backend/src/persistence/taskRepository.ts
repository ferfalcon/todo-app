import { prisma } from '../db/client';
import type { Task, UserId } from '../domain/models';
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
  async findAllByUser(userId: UserId): Promise<Task[]> {
    const records = await prisma.task.findMany({
      where: { userId },
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
};