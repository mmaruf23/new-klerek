import type { ApiResponse } from '@packages/contract';
import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { sendLog } from './utils/telegram.js';

export class Exception {
  public static NotFound(m?: string) {
    return new HTTPException(404, { message: m ?? 'NOT FOUND' });
  }

  public static BadRequest(m?: string) {
    return new HTTPException(400, { message: m ? m : 'BAD REQUEST' });
  }

  public static Validation(m?: string) {
    return new HTTPException(409, { message: m ? m : 'INVALID REQUEST' });
  }

  public static ServerError(m?: string) {
    return new HTTPException(500, { message: m ? m : 'INTERNAL SERVER ERROR' });
  }

  public static Unauthorized(m?: string) {
    return new HTTPException(401, { message: m ? m : 'UNAUTHORIZED' });
  }
}

export const errorHandler: ErrorHandler = async (err, c) => {
  if (err instanceof HTTPException) {
    if (err.status === 500) {
      sendLog(`🔴 SERVER ERROR\n${err.message}`);
    }
    return c.json<ApiResponse>(
      { success: false, message: err.message },
      err.status,
    );
  }

  sendLog(`🔴 UNHANDLED ERROR\n${err.message}`);
  console.error('SERVER ERROR : ', err.message);
  return c.json<ApiResponse>(
    { success: false, message: 'INTERNAL SERVER ERROR' },
    500,
  );
};

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json<ApiResponse>(
    {
      success: false,
      message: 'there is nothing here',
    },
    404,
  );
};
