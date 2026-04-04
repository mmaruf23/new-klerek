import { Hono } from 'hono';
import { login, type LoginPayload } from './service.js';
import type { ApiResponse } from '@packages/contract';

export const authHandler = new Hono().post('/login', async (c) => {
  let payload: LoginPayload;
  try {
    payload = await c.req.json<LoginPayload>();
  } catch (error) {
    return c.json<ApiResponse>(
      { success: false, message: 'invalid request payload' },
      400,
    );
  }
  const token = await login(payload);
  return c.json<ApiResponse<string>>({
    success: true,
    data: token,
  });
});
