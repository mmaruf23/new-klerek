import { Exception } from '../../error.js';
import { LoadConfig } from '../../config.js';
import { db } from '../../db/client.js';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema.js';
import { comparePassword } from '../../utils/bcrypt.js';
import { setClaims } from '../../utils/jwt.js';

export type LoginPayload = {
  username: string | undefined;
  password: string | undefined;
};

export const login = async (payload: LoginPayload) => {
  const config = LoadConfig();
  // console.log('ini payload : ', payload);
  if (!payload.username || !payload.password) throw Exception.Unauthorized();

  const u = await db.query.users.findFirst({
    where: eq(users.username, payload.username),
  });
  if (!u) throw Exception.Unauthorized();

  const validPassword = await comparePassword(payload.password, u.password);
  if (!validPassword) throw Exception.Unauthorized();

  const token = await setClaims({
    sub: u.id,
    exp: Math.floor(Date.now() / 1000 + 60 * 10), // 10 menit
  });

  return token;
};
