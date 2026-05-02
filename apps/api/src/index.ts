import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerekHandler } from "./features/clerek/handler.js";
import { storeHandler } from "./features/store/handler.js";
import { authHandler } from "./features/auth/handler.js";
import { paymentHandler } from "./features/payment/handler.js";
import { errorHandler, notFoundHandler } from "./error.js";
import { healthHandler } from "./features/health/handler.js";
import { config } from "./config.js";

const app = new Hono();
app.use(
  "/*",
  cors({
    origin: config.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.route("/", clerekHandler);
app.route("/auth", authHandler);
app.route("/store", storeHandler);
app.route("/health", healthHandler);
app.route("/payment", paymentHandler);
app.onError(errorHandler);
app.notFound(notFoundHandler);
export default app;
