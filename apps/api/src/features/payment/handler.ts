import { Hono } from "hono";
import type { ApiResponse } from "@packages/contract";
import { cookieMiddleware } from "../auth/middleware.js";
import { dataPrice } from "../subscription/data.js";
import {
  createQris,
  verifyCallbackSignature,
  type WijayapayCallback,
} from "../../utils/wijayapay.js";
import {
  createPendingPayment,
  updatePaymentQris,
  getPaymentByInvoiceId,
  getPaymentsByStoreId,
  fulfillPayment,
  expirePayment,
} from "./service.js";
import { Exception } from "../../error.js";
import { sendLog } from "../../utils/telegram.js";
import { config } from "../../config.js";
import type { JwtClaims } from "../../utils/jwt.js";

export const paymentHandler = new Hono()

  // GET /payment — daftar payment milik store yang login
  .get("/", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const payments = await getPaymentsByStoreId(claims.store_id);
    return c.json<ApiResponse<typeof payments>>({
      success: true,
      data: payments,
    });
  })

  // POST /payment/generate — buat QRIS baru
  // Body: { packageIndex: number }
  .post("/generate", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const body = await c.req.json<{ packageIndex: number }>();
    const pkg = dataPrice[body.packageIndex];
    if (pkg === undefined) throw Exception.BadRequest("invalid package index");

    const durationDays = Math.floor((pkg.time + (pkg.bonus ?? 0)) / 86_400);
    const refId = `klerek-${claims.store_id}-${Date.now()}`;

    const pending = await createPendingPayment({
      invoiceId: refId,
      storeId: claims.store_id,
      amount: pkg.price,
      durationDays,
    });

    let qrisResult;
    try {
      qrisResult = await createQris({
        refId,
        callbackUrl: config.WIJAYAPAY_CALLBACK_URL,
        nominal: pkg.price,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await sendLog(`🔴 GENERATE QRIS GAGAL\nToko: ${claims.store_id}\n${msg}`);
      console.error("Error creating QRIS:", err);
      throw Exception.ServerError();
    }

    const updated = await updatePaymentQris(pending.id, qrisResult.qrImage);

    return c.json<ApiResponse<typeof updated>>(
      { success: true, data: updated },
      201,
    );
  })

  // GET /payment/:invoiceId — cek status payment
  .get("/:invoiceId", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const invoiceId = c.req.param("invoiceId");
    const p = await getPaymentByInvoiceId(invoiceId);

    if (!p) throw Exception.NotFound();
    if (p.storeId !== claims.store_id) throw Exception.Unauthorized();

    return c.json<ApiResponse<typeof p>>({ success: true, data: p });
  })

  // POST /payment/callback — webhook dari WijayaPay
  .post("/callback", async (c) => {
    const body = await c.req.json<WijayapayCallback>();
    const xSignature = c.req.header("x-signature") ?? "";

    if (!verifyCallbackSignature(xSignature, body.ref_id)) {
      return c.json({ status: false }, 401);
    }

    if (body.status === "paid") {
      const paidAt = body.paid_at ? new Date(body.paid_at) : new Date();
      const result = await fulfillPayment(body.ref_id, paidAt);

      if (result) {
        await sendLog(
          `✅ PEMBAYARAN BERHASIL\nToko: ${result.payment.storeId}\nNominal: Rp${result.payment.amount.toLocaleString("id-ID")}\nAktif hingga: ${result.subscription.expiresAt.toLocaleDateString("id-ID")}`,
        );
      }
    } else if (body.status === "expired" || body.status === "failed") {
      await expirePayment(body.ref_id);
    }

    // WijayaPay mengharuskan response { status: true } agar tidak retry
    return c.json({ status: true });
  });
