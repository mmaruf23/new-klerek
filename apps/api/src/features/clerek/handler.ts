import { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { initAndValidateDB, prepareDbBuffer, processDB } from './service.js';
import { addNewStore, getStoreByIDWithLatestSubs } from '../store/service.js';
import { startTrial } from '../subscription/service.js';
import { DAY } from '../../constants/time.js';
import { cookieMiddleware } from '../auth/middleware.js';
import { setClaims, type JwtClaims } from '../../utils/jwt.js';
import { setCookie } from 'hono/cookie';
import { sendLog } from '../../utils/telegram.js';
import { config } from '../../config.js';

type StoreWithSubs = {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
  subs: {
    id: number;
    createdAt: Date;
    storeId: string;
    expiresAt: Date;
  }[];
};

export const clerekHandler = new Hono()
  // UPLOAD
  .post('/', cookieMiddleware, async (c) => {
    const form = await c.req.parseBody();
    const { buffer, userID, dateFx, storeID } = await prepareDbBuffer(
      form.file,
    );

    let store: StoreWithSubs | undefined;

    const claims = c.get('jwtPayload') as JwtClaims | undefined;
    if (claims?.store_id !== storeID) {
      store = await getStoreByIDWithLatestSubs(storeID);

      if (
        store &&
        store.subs.length &&
        store.subs[0].expiresAt.getTime() < Date.now()
      ) {
        sendLog(`⚠️ SUBSCRIPTION EXPIRED\nToko: ${storeID} mencoba upload tapi akses sudah habis.`);
        return c.json<ApiResponse>(
          { success: false, message: 'EXPIRED ACCESS' },
          401,
        );
      }

      if (store && !store.subs?.length) {
        // just in case, by logic harusnya semua store udah punya subs (trial)
        console.log(`starting trial for ${store.id}`);
        await startTrial(store.id);
      }
    }

    const db = initAndValidateDB(buffer);
    const data = processDB(db, userID, dateFx);
    db.close();

    if (!claims?.store_id && !store) {
      await addNewStore({
        id: data.store_id,
        name: data.store_name,
        branchId: data.branch_id,
      });
      await startTrial(data.store_id);
      sendLog(`🏪 TOKO BARU\nID: ${data.store_id}\nNama: ${data.store_name}`);
    }

    if (!claims) {
      const payload: JwtClaims = {
        store_id: storeID,
        exp: Math.floor((Date.now() + 7 * DAY) / 1000),
      };

      const token = await setClaims(payload);
      const isProd = config.NODE_ENV === 'production';
      setCookie(c, 'access_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: isProd ? 'None' : 'Lax',
        secure: isProd,
        maxAge: (7 * DAY) / 1000,
      });
    }

    c.header(
      'Expires-At',
      store && store.subs.length
        ? store.subs[0].expiresAt.getTime().toString()
        : (Date.now() + 7 * DAY).toString(),
    );

    return c.json<ApiResponse<typeof data>>({ success: true, data });
  });
