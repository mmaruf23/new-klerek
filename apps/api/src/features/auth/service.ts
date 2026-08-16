import { Exception } from "../../error.js";
import { db } from "../../db/client.js";
import { eq, sql } from "drizzle-orm";
import { users, store, balance } from "../../db/schema.js";
import { verifyGoogleIdToken } from "../../utils/googleAuth.js";
import { setClaims, getClaims } from "../../utils/jwt.js";
import { sendLog } from "../../utils/telegram.js";
import type { GoogleAuthInput } from "@packages/contract";

const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateReferralCode = () =>
  Array.from({ length: 6 }, () => REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)]).join("");

const generateUniqueReferralCode = async () => {
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
  return referralCode!;
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

  const [token, refreshToken] = await Promise.all([
    setClaims({
      sub: user.id,
      role: user.role,
      name: user.name,
      type: "access",
      exp: Math.floor(Date.now() / 1000 + 60 * 10),
    }),
    setClaims({
      sub: user.id,
      role: user.role,
      name: user.name,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
    }),
  ]);

  return { user, token, refreshToken };
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

export const getBalanceHistory = async (userId: string) => {
  return db.query.balance.findMany({
    where: eq(balance.userId, userId),
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
};

export const getProfile = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) throw Exception.NotFound("User tidak ditemukan");

  const [referredStores, balanceResult] = await Promise.all([
    user.refferalCode
      ? db.query.store.findMany({
          where: eq(store.referrerId, user.refferalCode),
          columns: { id: true, name: true, branchId: true, createdAt: true },
        })
      : Promise.resolve([]),
    db
      .select({
        total: sql<number>`sum(case when ${balance.type} = 'credit' then ${balance.amount} else -${balance.amount} end)`,
      })
      .from(balance)
      .where(eq(balance.userId, userId)),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    referralCode: user.refferalCode,
    referredStores,
    totalBalance: Number(balanceResult[0]?.total ?? 0),
  };
};
