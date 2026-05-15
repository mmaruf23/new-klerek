import { Exception } from "../../error.js";
import { db } from "../../db/client.js";
import { eq } from "drizzle-orm";
import { users, store } from "../../db/schema.js";
import { comparePassword, hashPassword } from "../../utils/bcrypt.js";
import { setClaims } from "../../utils/jwt.js";
import type { LoginInput, RegisterInput } from "@packages/contract";

const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateReferralCode = () =>
  Array.from({ length: 6 }, () => REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)]).join("");

export const login = async (payload: LoginInput) => {
  const u = await db.query.users.findFirst({
    where: eq(users.username, payload.username),
  });
  if (!u) throw Exception.Unauthorized("Username atau Password salah");

  const validPassword = await comparePassword(payload.password, u.password);
  if (!validPassword) throw Exception.Unauthorized("Username atau Password salah");

  const token = await setClaims({
    sub: u.id,
    role: u.role,
    exp: Math.floor(Date.now() / 1000 + 60 * 10),
  });

  return token;
};

export const register = async (payload: RegisterInput) => {
  const existing = await db.query.users.findFirst({
    where: eq(users.username, payload.username),
  });
  if (existing) throw Exception.Validation("Username sudah digunakan");

  const hashed = await hashPassword(payload.password);

  let referralCode: string;
  let attempts = 0;
  do {
    referralCode = generateReferralCode();
    const taken = await db.query.users.findFirst({
      where: eq(users.refferalCode, referralCode),
    });
    if (!taken) break;
    attempts++;
  } while (attempts < 5);

  const [user] = await db
    .insert(users)
    .values({
      name: payload.name,
      username: payload.username,
      password: hashed,
      role: "user",
      refferalCode: referralCode!,
    })
    .returning();

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    referralCode: user.refferalCode,
  };
};

export const getProfile = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) throw Exception.NotFound("User tidak ditemukan");

  const referredStores = user.refferalCode
    ? await db.query.store.findMany({
        where: eq(store.referrerId, user.refferalCode),
        columns: { id: true, name: true, branchId: true, createdAt: true },
      })
    : [];

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    referralCode: user.refferalCode,
    referredStores,
  };
};
