import type { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { isDBOK } from '../../db/client.js';

export const healthHandler = new Hono()
  .get('/', async (c) => {
    return c.json<ApiResponse>({
      success: true,
      message: 'OK',
    });
  })
  .get('/db', async (c) => {
    if (!isDBOK)
      return c.json<ApiResponse>({
        success: false,
        message: 'DB IS NOT OK',
      });

    return c.json<ApiResponse>({
      success: true,
      message: 'DB IS OK',
    });
  });
