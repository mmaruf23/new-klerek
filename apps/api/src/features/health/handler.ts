import type { ApiResponse } from "@packages/contract";
import { Hono } from "hono";
import { checkDB } from "../../db/client.js";
import { pingTelegram } from "../../utils/telegram.js";
import { Config, config } from "../../config.js";
import { authMiddleware } from "../auth/middleware.js";

export const healthHandler = new Hono()
  .get("/", (c) => {
    return c.json<ApiResponse>({ success: true, message: "OK" });
  })
  .get("/db", async (c) => {
    const ok = await checkDB();
    if (!ok)
      return c.json<ApiResponse>(
        { success: false, message: "DB IS NOT OK" },
        503,
      );

    return c.json<ApiResponse>({ success: true, message: "DB IS OK" });
  })
  .get("/telegram", async (c) => {
    const ok = await pingTelegram();
    if (!ok)
      return c.json<ApiResponse>(
        { success: false, message: "TELEGRAM IS NOT OK" },
        503,
      );

    return c.json<ApiResponse>({ success: true, message: "TELEGRAM IS OK" });
  })
  .get("/config", authMiddleware, async (c) => {
    return c.json<ApiResponse<Config>>({
      success: true,
      message: "OK",
      data: config,
    });
  });
