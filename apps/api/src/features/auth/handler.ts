import { Hono } from 'hono';
import { login, type LoginPayload } from './service.js';
import type { ApiResponse } from '@packages/contract';

export const authHandler = new Hono().post('/login', async (c) => {
  const payload = await c.req.json<LoginPayload>();

  const token = await login(payload);
  return c.json<ApiResponse<string>>({
    success: true,
    data: token,
  });
});
