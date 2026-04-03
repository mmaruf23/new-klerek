import 'dotenv/config';
import { sign } from 'hono/jwt';
import { Exception } from '../../error.js';

export type LoginPayload = {
  username: string | undefined;
  password: string | undefined;
};

export const login = async (payload: LoginPayload) => {
  console.log('ini payload : ', payload);
  if (!payload.username || payload.username !== process.env.USERNAME)
    throw Exception.Unauthorized();
  if (!payload.password || payload.password !== process.env.PASSWORD)
    throw Exception.Unauthorized('wrong password!');

  const token = await sign(
    {
      exp: Math.floor(Date.now() / 1000 + 60 * 10),
    },
    process.env.JWT_SECRET!,
  );

  return token;
};
