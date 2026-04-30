import 'dotenv/config';

export interface Config {
  NODE_ENV: 'production' | 'development';
  DB_URL: string;
  JWT_SECRET: string;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV == 'production' ? 'production' : 'development',
  DB_URL:
    process.env.DB_URL ??
    'postgresql://postgres:password@localhost:5432/klerek',
  JWT_SECRET: process.env.JWT_SECRET ?? 'ngasalajaudah',
};

export const LoadConfig = (): Config => {
  if (config) return config;
  return {
    NODE_ENV:
      process.env.NODE_ENV == 'production' ? 'production' : 'development',
    DB_URL:
      process.env.DB_URL ??
      'postgresql://postgres:password@localhost:5432/klerek',
    JWT_SECRET: process.env.JWT_SECRET ?? 'ngasalajaudah',
  };
};
