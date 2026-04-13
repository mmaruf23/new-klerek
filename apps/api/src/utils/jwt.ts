import { getCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { LoadConfig } from '../config.js';
import type { JWTPayload } from 'hono/utils/jwt/types';

const config = LoadConfig();

export interface JwtClaims extends JWTPayload {
  readonly store_id: string;
}

export const setClaims = async (store_id: string, exp: number) => {
  const payload: JwtClaims = { store_id, exp };
  const token = await sign(payload, config.JWT_SECRET, 'HS256');

  return token;
};

export const getClaims = async (token: string) => {
  let claims: JwtClaims;

  try {
    claims = (await verify(token, config.JWT_SECRET, 'HS256')) as JwtClaims;
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    console.log('Failed get claims from this : ', token, msg);
    return;
  }
  return claims;
};
