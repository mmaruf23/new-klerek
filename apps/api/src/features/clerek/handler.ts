import { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { initAndValidateDB, prepareDbBuffer, processDB } from './service.js';
import { getStoreByIDWithLatestSubs } from '../store/service.js';

export const clerekHandler = new Hono()
  // UPLOAD
  .post('/', async (c) => {
    const form = await c.req.parseBody();
    const { buffer, userID, dateFx, storeID } = await prepareDbBuffer(
      form.file,
    );

    const store = await getStoreByIDWithLatestSubs(storeID);

    if (
      store &&
      store.subs[0] &&
      store.subs[0].expiresAt.getTime() < Date.now()
    ) {
      return c.json<ApiResponse>(
        { success: false, message: 'EXPIRED ACCESS' },
        401,
      );
    }

    if (store && !store.subs.length) {
      // LANJUT SINI : nanti lanjut bikin store service + subscription servicenya
      // ini artinya nggak punya subs, kasih trial.
    }

    if (!store) {
      // bikin new store disini + kasih trial.
    }

    const db = initAndValidateDB(buffer);
    const data = processDB(db, userID, dateFx);

    return c.json<ApiResponse<typeof data>>({ success: true, data });
  });
