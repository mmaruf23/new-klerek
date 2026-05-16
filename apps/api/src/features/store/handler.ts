import type { ApiResponse, JwtClaims } from '@packages/contract';
import { Hono } from 'hono';
import { getAllStore, getStoreByIDWithLatestSubs, addSubscriptionByBalance } from './service.js';
import { isValidStoreID } from './helper.js';
import { Exception } from '../../error.js';
import { authMiddleware } from '../auth/middleware.js';

export const storeHandler = new Hono()
  .get('/', authMiddleware, async (c) => {
    const limit = Math.max(1, Number(c.req.query('limit') ?? 20) || 20);
    const offset = Math.max(0, Number(c.req.query('offset') ?? 0) || 0);
    const stores = await getAllStore({ limit, offset });

    return c.json<ApiResponse<typeof stores>>({
      success: true,
      data: stores,
    });
  })
  .get('/:id', authMiddleware, async (c) => {
    const id = c.req.param('id');
    if (!isValidStoreID(id)) throw Exception.Validation('invalid store id');

    const data = await getStoreByIDWithLatestSubs(id);
    if (!data) throw Exception.NotFound('store not found');

    return c.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  })

  // POST /store/:id/subscribe — tambah subscription via balance
  // Hanya untuk toko yang refer ke akun pemanggil. Superadmin tidak dikenai debit.
  .post('/:id/subscribe', authMiddleware, async (c) => {
    const id = c.req.param('id');
    if (!isValidStoreID(id)) throw Exception.Validation('invalid store id');

    const payload = c.get('jwtPayload') as JwtClaims;
    const userId = payload.sub!;
    const userRole = payload.role ?? 'user';

    const body = await c.req.json<{ packageIndex: unknown }>();
    if (typeof body.packageIndex !== 'number') throw Exception.BadRequest('packageIndex must be a number');

    const result = await addSubscriptionByBalance(userId, userRole, id, body.packageIndex);

    return c.json<ApiResponse<typeof result>>({ success: true, data: result }, 201);
  });
