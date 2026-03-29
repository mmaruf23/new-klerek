import { HTTPException } from 'hono/http-exception';

export class Exception {
  public static NotFound(m: string) {
    return new HTTPException(404, { message: 'NOT FOUND' });
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
}
