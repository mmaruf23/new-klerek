interface Config {
  API_URL: string;
  ACCESS_TOKEN_KEY: string;
  STORE_PAGE_LIMIT: number;
}

export const config: Config = {
  API_URL: import.meta.env.VITE_API_URL ?? "",
  ACCESS_TOKEN_KEY: import.meta.env.VITE_ACCESS_TOKEN_KEY ?? "access_token",
  STORE_PAGE_LIMIT: isNaN(Number(import.meta.env.VITE_STORE_PAGE_LIMIT))
    ? Number(import.meta.env.VITE_STORE_PAGE_LIMIT)
    : 20,
};
