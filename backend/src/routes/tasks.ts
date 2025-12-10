import { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/client";
import { tasksRepository } from "../persistence/taskRepository";
import type { UserId } from "../domain/models";
import { 
  listTasksRouteOptions, 
  createTaskRouteOptions, 
  updateTaskRouteOptions,
  deleteTaskRouteOptions,
  deleteCompleteRouteOptions
} from '../schemas/taskSchemas';

const tasksRoutes: FastifyPluginAsync = async (fastify, opts) => {
  async function ensureDemoUser(): Promise<UserId> {
    const email = 'demo@example.com';

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: 'demo-hash',
      },
    });

    return user.id as UserId;
  };

  fastify.get('/tasks', listTasksRouteOptions, async (request, reply) => {
    const userId = await ensureDemoUser();

    const { status } = request.query as {
      status?: 'all' | 'active' | 'completed';
    };

    const filterStatus = status === 'active' || status === 'completed' ? status : undefined;
    
    const tasks = await tasksRepository.findAllByUser(userId, filterStatus);

    return { items: tasks };
  });

  fastify.post('/tasks', createTaskRouteOptions, async (request, reply) => {
    const userId = await ensureDemoUser();
    const body = request.body as { title?: string };

    if (!body?.title || body.title.trim() === '') {
      reply.code(400);
      return { error: 'Title is required'};
    }

    const task = await tasksRepository.createForUser(
      userId,
      body.title.trim(),
    );

    reply.code(201);
    return task;
  });

  fastify.patch('/tasks/:taskId', updateTaskRouteOptions, async (request, reply) => {
    const userId = await ensureDemoUser();

    const { taskId } = request.params as { taskId: string };

    const body = request.body as {
      title?: string;
      status?: 'active' | 'completed';
    };

    const changes: {
      title?: string;
      status?: 'active' | 'completed';
    } = {};

    if (typeof body.title === 'string') {
      changes.title = body.title.trim();
    }
    if (body.status) {
      changes.status = body.status;
    }

    const updated = await tasksRepository.updateForUser(
      userId,
      taskId,
      changes,
    );

    if (!updated) {
      reply.code(404);
      return { error: 'Task not found' };
    }

    return updated;
  });

  fastify.delete('/task/:taskId', deleteTaskRouteOptions, async(request, reply) => {
    const userId = await ensureDemoUser();
    const { taskId } = request.params as { taskId: string };

    const deleted = await tasksRepository.deleteForUser(userId, taskId);

    if (!deleted) {
      reply.code(404);
      return { error: 'Task not found'};
    }

    reply.code(204).send();
  });

  fastify.delete('/task/completed', deleteCompleteRouteOptions, async (request, reply) => {
    const userId = await ensureDemoUser();

    const deleteCount = await tasksRepository.clearCompleteForUser(userId);

    return { deleted: deleteCount }
  });
};

export default tasksRoutes;
