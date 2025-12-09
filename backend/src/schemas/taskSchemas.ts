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

// JSON Schema for POST /tasks body
export const taskCreateBodySchema = {
  $id: 'TaskCreateBody',
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
  },
  required: ['title'],
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
