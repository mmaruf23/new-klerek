import type { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { getAllStore, getStoreByIDWithLatestSubs } from './service.js';
import { isValidStoreID } from './helper.js';
import { Exception } from '../../error.js';
import { adminMiddleware } from '../auth/middleware.js';

export const storeHandler = new Hono()
  .get('/', adminMiddleware, async (c) => {
    const limit = Math.max(1, Number(c.req.query('limit') ?? 20) || 20);
    const offset = Math.max(0, Number(c.req.query('offset') ?? 0) || 0);
    const stores = await getAllStore({ limit, offset });

    return c.json<ApiResponse<typeof stores>>({
      success: true,
      data: stores,
    });
  })
  .get('/:id', adminMiddleware, async (c) => {
    const id = c.req.param('id');
    if (!isValidStoreID(id)) throw Exception.Validation('invalid store id');

    const data = await getStoreByIDWithLatestSubs(id);
    if (!data) throw Exception.NotFound('store not found');

    return c.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  });
