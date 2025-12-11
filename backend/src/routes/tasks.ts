import { FastifyPluginAsync } from "fastify";
import { tasksRepository } from "../persistence/taskRepository";
import { 
  listTasksRouteOptions, 
  createTaskRouteOptions, 
  updateTaskRouteOptions,
  deleteTaskRouteOptions,
  deleteCompleteRouteOptions,
  reorderTasksRouteOptions
} from '../schemas/taskSchemas';

const tasksRoutes: FastifyPluginAsync = async (fastify, opts) => {
  const requireAuth = fastify.authenticate as any;

  // GET /tasks → list all tasks for the authenticated user
  fastify.get('/tasks', { ...listTasksRouteOptions, preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as { userId: string; email: string};

    const { status } = request.query as {
      status?: 'all' | 'active' | 'completed';
    };

    const filterStatus = status === 'active' || status === 'completed' ? status : undefined;
    
    const tasks = await tasksRepository.findAllByUser(userId, filterStatus);

    return { items: tasks };
  });

  // POST /tasks → create a new task for the authenticated user
  fastify.post('/tasks', { ...createTaskRouteOptions, preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as { userId: string; email: string };
  
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

  // PATCH /tasks/:taskId → update title and/or status
  fastify.patch('/tasks/:taskId', { ...updateTaskRouteOptions, preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as { userId: string; email: string };

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

  // DELETE /tasks/:taskId → remove a task
  fastify.delete('/tasks/:taskId', { ...deleteTaskRouteOptions, preHandler: requireAuth }, async(request, reply) => {
    const { userId } = request.user as { userId: string; email: string };

    const { taskId } = request.params as { taskId: string };

    const deleted = await tasksRepository.deleteForUser(userId, taskId);

    if (!deleted) {
      reply.code(404);
      return { error: 'Task not found'};
    }

    reply.code(204).send();
  });

  // DELETE /tasks/completed → delete all completed tasks for the authenticated user
  fastify.delete('/tasks/completed',{ ...deleteCompleteRouteOptions, preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as { userId: string; email: string };

    const deleteCount = await tasksRepository.clearCompletedForUser(userId);

    return { deleted: deleteCount }
  });

  // POST /tasks/reorder → update order of all tasks for the authenticated user
  fastify.post('/tasks/reorder',{ ...reorderTasksRouteOptions, preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.user as { userId: string; email: string };

    const { orderedIds } = request.body as { 
      orderedIds: string[];
    };

    const reordered = await tasksRepository.reorderForUser(userId, orderedIds);

    if (!reordered) {
      reply.code(400);
      return { error: 'Invalid orderedIds. They must contain each of the current user’s task IDs exactly once.' };
    }

    return { items: reordered };
  });
};

export default tasksRoutes;
