import { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { initAndValidateDB, prepareDbBuffer, processDB } from './service.js';
import { addNewStore, getStoreByIDWithLatestSubs } from '../store/service.js';
import { startTrial } from '../subscription/service.js';
import { DAY } from '../../constant/time.js';

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
      // just in case, by logic harusnya semua store udah punya subs (trial)
      console.log(`starting trial for ${store.id}`);
      await startTrial(store.id);
    }

    const db = initAndValidateDB(buffer);
    const data = processDB(db, userID, dateFx);
    if (!store) {
      await addNewStore({
        id: data.store_id,
        name: data.store_name,
        branchId: data.branch_id,
      });
      await startTrial(data.store_id);
    }

    c.header(
      'Expires-At',
      store && store.subs.length
        ? store.subs[0].expiresAt.getTime().toString()
        : (Date.now() + 7 * DAY).toString(),
    );
    return c.json<ApiResponse<typeof data>>({ success: true, data });
  });
