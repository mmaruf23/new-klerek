interface Config {
  API_URL: string;
  ACCESS_TOKEN_KEY: string;
  STORE_PAGE_LIMIT: number;
  GOOGLE_CLIENT_ID: string;
}

const storePageLimit = Number(import.meta.env.VITE_STORE_PAGE_LIMIT);

export const config: Config = {
  API_URL: import.meta.env.VITE_API_URL ?? "",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
  ACCESS_TOKEN_KEY: import.meta.env.VITE_ACCESS_TOKEN_KEY ?? "access_token",
  // env kosong → Number("") = 0, jadi cek > 0 (bukan sekadar isNaN)
  STORE_PAGE_LIMIT: Number.isInteger(storePageLimit) && storePageLimit > 0 ? storePageLimit : 20,
};
