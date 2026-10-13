import { Exception } from "../../error.js";
import { db } from "../../db/client.js";
import { eq, sql } from "drizzle-orm";
import { users, store, balance, User } from "../../db/schema.js";
import { verifyGoogleIdToken } from "../../utils/googleAuth.js";
import { setClaims, getClaims } from "../../utils/jwt.js";
import { sendLog } from "../../utils/telegram.js";
import type { GoogleAuthInput, LoginAuthInput } from "@packages/contract";
import { comparePassword, getUsernameFromEmail } from "./utils.js";
import { generateUniqueReferralCode } from "../user/service.js";

export const loginWithPassword = async (paylaod: LoginAuthInput) => {
  const user = await db.query.users.findFirst({
    where: eq(users.username, paylaod.username),
  });
  if (!user || !user.password) throw Exception.Unauthorized("wrong username or password");
  const match = await comparePassword(paylaod.password, user.password);
  if (!match) throw Exception.Unauthorized("wrong username or password");

  return user;
};

export const loginWithGoogle = async (payload: GoogleAuthInput) => {
  const profile = await verifyGoogleIdToken(payload.credential);

  let user = await db.query.users.findFirst({
    where: eq(users.email, profile.email),
  });

  if (!user) {
    // Role bersifat DB-authoritative: user baru selalu "user", promosi ke
    // admin/superadmin dilakukan lewat panel superadmin atau seed bootstrap.
    const referralCode = await generateUniqueReferralCode();
    [user] = await db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        username: getUsernameFromEmail(profile.email),
        googleId: profile.googleId,
        avatarUrl: profile.picture,
        role: "user",
        refferalCode: referralCode,
      })
      .returning();
    await sendLog(`👤 User baru login via Google: ${user.name} (${user.email}) — role: ${user.role}`);
  } else if (
    // Sinkron profil dari Google, tapi role tidak pernah ditimpa saat login.
    user.name !== profile.name ||
    user.googleId !== profile.googleId ||
    user.avatarUrl !== profile.picture
  ) {
    [user] = await db
      .update(users)
      .set({
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.picture,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
  }

  return user;
};

export const issueToken = async (claims: User) => {
  const [token, refreshToken] = await Promise.all([
    setClaims({
      sub: claims.id,
      role: claims.role,
      name: claims.name,
      type: "access",
      exp: Math.floor(Date.now() / 1000 + 60 * 10),
    }),
    setClaims({
      sub: claims.id,
      role: claims.role,
      name: claims.name,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
    }),
  ]);

  return { token, refreshToken };
};

export const refreshUserToken = async (token: string) => {
  const claims = await getClaims(token);
  if (!claims || claims.type !== "refresh" || !claims.sub) throw Exception.Unauthorized();

  const user = await db.query.users.findFirst({ where: eq(users.id, claims.sub) });
  if (!user) throw Exception.Unauthorized();

  const newToken = await setClaims({
    sub: user.id,
    role: user.role,
    name: user.name,
    type: "access",
    exp: Math.floor(Date.now() / 1000 + 60 * 10),
  });

  return { token: newToken };
};

