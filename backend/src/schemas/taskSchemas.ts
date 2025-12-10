import type { RouteShorthandOptions } from 'fastify';

// JSON Schema for a single Task on the wire
export const taskSchema = {
  $id: 'Task',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    title: { type: 'string' },
    status: { type: 'string', enum: ['active', 'completed'] },
    order: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'userId',
    'title',
    'status',
    'order',
    'createdAt',
    'updatedAt',
  ],
} as const;

// JSON Schema for POST /tasks body
export const taskCreateBodySchema = {
  $id: 'TaskCreateBody',
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
  },
  required: ['title'],
} as const;

export const taskUpdateBodySchema = {
  $id: 'TaskUpdateBody',
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    status: { type: 'string', enum: ['active', 'completed'] },
  },
  additionalProperties: false,
  minProperties: 1,
} as const;

// JSON Schema for { items: Task[] }
export const taskListResponseSchema = {
  $id: 'TaskListResponse',
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: 'Task#' },
    },
  },
  required: ['items'],
} as const;

export const taskReorderBodySchema = {
  $id: 'TaskReorderBody',
  type: 'object',
  properties: {
    orderedIds: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
  },
  required: ['orderedIds'],
  additionalProperties: false,
} as const;

// Route options for GET /tasks
export const listTasksRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'List all tasks for the current user',
    querystring: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'active', 'completed'],
        },
      },
    },
    response: {
      200: { $ref: 'TaskListResponse#' },
    },
  },
};

// Route options for POST /tasks
export const createTaskRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'Create a new task for the current user',
    body: { $ref: 'TaskCreateBody#' },
    response: {
      201: { $ref: 'Task#' },
      // We *do* return 400 in the handler for bad titles, but we keep
      // docs simple for now and only describe the happy-path 201.
    },
  },
};

export const updateTaskRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'Update a task (rename and/or change status)',
    params: {
      type: 'object',
      properties: {
        taskId: { type: 'string' },
      },
      required: ['taskId'],
    },
    body: { $ref: 'TaskUpdateBody#' },
    response: {
      200: { $ref: 'Task#' },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};

export const deleteTaskRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'Delete a task',
    params: {
      type: 'object',
      properties: {
        taskId: { type: 'string' },
      },
      required: ['taskId'],
    },
    response: {
      204: {
        description: 'Task deleted successfully',
        type: 'null',
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};

export const deleteCompleteRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'Delete all completed tasks for the current user',
    response: {
      200: {
        description: 'Number of completed tasks that were deleted',
        type: 'object',
        properties: {
          deleted: { type: 'integer', minimum: 0 },
        },
        required: ['deleted'],
      },
    },
  },
};

export const reorderTasksRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Tasks'],
    summary: 'Reorder all tasks for the current user',
    description:
      'orderedIds must contain each of the current user’s task IDs exactly once.',
    body: { $ref: 'TaskReorderBody#' },
    response: {
      200: { $ref: 'TaskListResponse#' },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};