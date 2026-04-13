import { sign } from 'hono/jwt';
import { Exception } from '../../error.js';
import { LoadConfig } from '../../config.js';

export type LoginPayload = {
  username: string | undefined;
  password: string | undefined;
};

export const login = async (payload: LoginPayload) => {
  const config = LoadConfig();
  console.log('ini payload : ', payload);
  if (!payload.username || payload.username !== config.USERNAME)
    throw Exception.Unauthorized();
  if (!payload.password || payload.password !== config.PASSWORD)
    throw Exception.Unauthorized('wrong password!');

  const token = await sign(
    {
      exp: Math.floor(Date.now() / 1000 + 60 * 10),
    },
    config.JWT_SECRET,
  );

  return token;
};
