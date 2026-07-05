import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";
import { Exception } from "../error.js";

// Module scope agar cache JWKS bertahan antar warm invocation di serverless
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

export const verifyGoogleIdToken = async (credential: string): Promise<GoogleProfile> => {
  let payload;
  try {
    ({ payload } = await jwtVerify(credential, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: config.GOOGLE_CLIENT_ID,
    }));
  } catch {
    throw Exception.Unauthorized("Login Google tidak valid");
  }

  if (payload.email_verified !== true || typeof payload.email !== "string" || !payload.sub) {
    throw Exception.Unauthorized("Login Google tidak valid");
  }

  const email = payload.email.toLowerCase();
  return {
    googleId: payload.sub,
    email,
    name: typeof payload.name === "string" && payload.name ? payload.name : email,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
};
