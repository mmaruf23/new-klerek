interface Config {
  API_URL: string;
  ACCESS_TOKEN_KEY: string;
  USER_DATA_KEY: string;
  STORE_PAGE_LIMIT: number;
  GOOGLE_CLIENT_ID: string;
}

export const config: Config = {
  API_URL: import.meta.env.VITE_API_URL ?? "",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
  ACCESS_TOKEN_KEY: import.meta.env.VITE_ACCESS_TOKEN_KEY ?? "access_token",
  USER_DATA_KEY: "user_data",
  STORE_PAGE_LIMIT: isNaN(Number(import.meta.env.VITE_STORE_PAGE_LIMIT))
    ? Number(import.meta.env.VITE_STORE_PAGE_LIMIT)
    : 20,
};
