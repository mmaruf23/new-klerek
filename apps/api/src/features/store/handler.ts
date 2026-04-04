import type { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import {
  getAllStore,
  getStoreByIDWithActiveSubsDescending,
} from './service.js';
import { isValidStoreID } from './helper.js';
import { Exception } from '../../error.js';
import { jwtMiddleware } from '../auth/middleware.js';

export const storeHandler = new Hono()
  .get('/', jwtMiddleware, async (c) => {
    const stores = await getAllStore({ limit: 100, offset: 0 });

    return c.json<ApiResponse<typeof stores>>({
      success: true,
      data: stores,
    });
  })
  .get('/:id', jwtMiddleware, async (c) => {
    const id = c.req.param('id');
    if (!isValidStoreID(id)) throw Exception.Validation('invalid store id');

    const data = await getStoreByIDWithActiveSubsDescending(id);
    if (!data) throw Exception.NotFound('store not found');

    return c.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  });
