import { Hono } from 'hono';
import { clerekHandler } from './features/clerek/handler.js';
import type { ApiResponse } from '@packages/contract';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

const welcomeStrings = [
  'Hello Hono!',
  'To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono',
];

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'));
});

app.route('/', clerekHandler);

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    return c.json<ApiResponse>(
      { success: false, message: err.message },
      err.status,
    );
  }

  return c.json<ApiResponse>({ success: false, message: err.message }, 500);
});

export default app;
