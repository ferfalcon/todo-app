# Todo app

![Design preview for the Todo app coding challenge](preview.jpg)

This is an extended solution to the [Todo app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/todo-app-Su1_KokOW). It includes built a todo task manager with user authentication. Implemented RESTful API design, database CRUD operations, and real-time updates across devices using WebSockets.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

**Create a production-ready todo application**

Users should be able to:
- Add new todos to the list
- Mark todos as complete
- Delete todos from the list
- Filter by all/active/complete todos
- Clear all completed todos
- Toggle light and dark mode
- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Drag and drop to reorder items on the list

### Links

- Frontend Live Site URL: [https://todo-app-frontend-w1e2.onrender.com](https://todo-app-frontend-w1e2.onrender.com)
- Backend Live Site URL: [https://todo-app-backend-ufzj.onrender.com](https://todo-app-backend-ufzj.onrender.com)
- Repository: [https://github.com/ferfalcon/todo-app](https://github.com/ferfalcon/todo-app)

## My process

### Built with

#### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (LTS, 22.20.0)
  - **Language:** [TypeScript](https://www.typescriptlang.org/)
  - **Framework:** [Fastify](https://fastify.dev/)
  - **API style:** REST, JSON
  - **DB:** [SQLite](https://sqlite.org/) in development, [PostgreSQL](https://www.postgresql.org/) in production
  - **ORM/DB layer:** [Prisma](https://www.prisma.io/)

#### Frontend
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build tooling:** [Vite](https://vite.dev/)
- **Library:** [React](https://reactjs.org/)
- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow

### What I learned

If you bootstrap your Fastify app with Fastify-CLI, you get this for free!
Plugins and routes are autoloaded.

```ts
import { join } from 'node:path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {};
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
export { app, options };
```

### Continued development

Use this section to outline areas that you want to continue focusing on in future projects. These could be concepts you're still not completely comfortable with or techniques you found useful that you want to refine and perfect.

### Useful resources

- [Example resource 1](https://www.example.com) - This helped me for XYZ reason. I really liked this pattern and will use it going forward.
- [Example resource 2](https://www.example.com) - This is an amazing article which helped me finally understand XYZ. I'd recommend it to anyone still learning this concept.

## Author

- LinkedIn - [Fernando Falcon](https://www.linkedin.com/in/fernandofalcon/)
- Website - [ferfalcon.com](http://ferfalcon.com/)
- Frontend Mentor - [@ferfalcon](https://www.frontendmentor.io/profile/ferfalcon/)
