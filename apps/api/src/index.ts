import { Hono } from "hono";
import { clerekHandler } from "./features/clerek/handler.js";
import { storeHandler } from "./features/store/handler.js";
import { authHandler } from "./features/auth/handler.js";
import { errorHandler, notFoundHandler } from "./error.js";
import { healthHandler } from "./features/health/handler.js";
import { cors } from "hono/cors";

const app = new Hono();
app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.route("/", clerekHandler);
app.route("/auth", authHandler);
app.route("/store", storeHandler);
app.route("/health", healthHandler);
app.onError(errorHandler);
app.notFound(notFoundHandler);
export default app;
