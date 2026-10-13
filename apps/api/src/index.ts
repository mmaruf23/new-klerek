import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerekHandler } from "./features/clerek/handler.js";
import { storeHandler } from "./features/store/handler.js";
import { authHandler } from "./features/auth/handler.js";
import { paymentHandler } from "./features/payment/handler.js";
import { userHandler } from "./features/user/handler.js";
import { errorHandler, notFoundHandler } from "./error.js";
import { healthHandler } from "./features/health/handler.js";
import { config } from "./config.js";

const app = new Hono()
  .use(
    "/*",
    cors({
      origin: config.CORS_ORIGIN,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  )
  .route("/", clerekHandler)
  .route("/auth", authHandler)
  .route("/store", storeHandler)
  .route("/health", healthHandler)
  .route("/payment", paymentHandler)
  .route("/admin", userHandler)
  .onError(errorHandler)
  .notFound(notFoundHandler);
export default app;

export type AppType = typeof app;
