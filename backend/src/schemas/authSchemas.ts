import type { RouteShorthandOptions } from 'fastify';

export const userSchema = {
  $id: 'User',
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  required: ['id', 'email'],
} as const;

export const authSignupBodySchema = {
  $id: 'AuthSignupBody',
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

export const authLoginBodySchema = {
  $id: 'AuthLoginBody',
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

export const authUserWithTokenSchema = {
  $id: 'AuthUserWithToken',
  type: 'object',
  properties: {
    user: { $ref: 'User#' },
    token: { type: 'string' },
  },
  required: ['user', 'token'],
} as const;

// Route options: POST /auth/signup
export const signupRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    summary: 'Sign up a new user',
    body: { $ref: 'AuthSignupBody#' },
    response: {
      201: { $ref: 'AuthUserWithToken#' },
      409: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};

// Route options: POST /auth/login
export const loginRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    summary: 'Log in an existing user',
    body: { $ref: 'AuthLoginBody#' },
    response: {
      200: { $ref: 'AuthUserWithToken#' },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};

// Route options: GET /me
export const meRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    summary: 'Get the current authenticated user',
    security: [{ bearerAuth: [] }],
    response: {
      200: { $ref: 'User#' },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
};
