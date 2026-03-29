import { ApiResponse } from '@packages/contract';
import { Hono } from 'hono';
import { preparingFileDB, processDB } from './service.js';

export const clerekHandler = new Hono()
  // UPLOAD
  .post('/', async (c) => {
    const form = await c.req.parseBody();
    const { dataBuffer, userID, fakturPrefix, storeID } = await preparingFileDB(
      form.file,
    );

    const data = processDB(dataBuffer, userID, fakturPrefix);

    return c.json<ApiResponse<typeof data>>({ success: true, data });
  });
