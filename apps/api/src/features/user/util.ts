const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateReferralCode = () =>
  Array.from({ length: 6 }, () => REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)]).join("");


