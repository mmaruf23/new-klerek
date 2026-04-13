import { jwt } from 'hono/jwt';
import { LoadConfig } from '../../config.js';
import type { MiddlewareHandler } from 'hono';
import { getClaims, type JwtClaims } from '../../utils/jwt.js';
import { getCookie } from 'hono/cookie';

export const jwtMiddleware = jwt({
  secret: LoadConfig().JWT_SECRET,
  alg: 'HS256',
});

export const cookieMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'access_token');

  let claims: JwtClaims | undefined;

  if (token) claims = await getClaims(token);
  if (claims) c.set('jwtPayload', claims);

  await next();
};
