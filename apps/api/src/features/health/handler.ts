import type { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { checkDB } from '../../db/client.js';
import { pingTelegram } from '../../utils/telegram.js';

export const healthHandler = new Hono()
  .get('/', (c) => {
    return c.json<ApiResponse>({ success: true, message: 'OK' });
  })
  .get('/db', async (c) => {
    const ok = await checkDB();
    if (!ok)
      return c.json<ApiResponse>({ success: false, message: 'DB IS NOT OK' }, 503);

    return c.json<ApiResponse>({ success: true, message: 'DB IS OK' });
  })
  .get('/telegram', async (c) => {
    const ok = await pingTelegram();
    if (!ok)
      return c.json<ApiResponse>({ success: false, message: 'TELEGRAM IS NOT OK' }, 503);

    return c.json<ApiResponse>({ success: true, message: 'TELEGRAM IS OK' });
  });
