import { Hono } from "hono";
import { generatePaymentSchema, dataPrice } from "@packages/contract";
import type { ApiResponse, JwtClaims } from "@packages/contract";
import { cookieMiddleware } from "../auth/middleware.js";
import { createDonation, checkDonationStatus } from "../../utils/saweria.js";
import {
  createPendingPayment,
  getPaymentByInvoiceId,
  getPaymentsByStoreId,
  fulfillPayment,
  expirePayment,
  isPaymentExpired,
} from "./service.js";
import { Exception } from "../../error.js";
import { sendLog } from "../../utils/telegram.js";

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

  // POST /payment/generate — buat donasi QRIS di Saweria
  // Body: { packageIndex: number, email: string }
  .post("/generate", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const result = generatePaymentSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!result.success) {
      return c.json({ success: false, message: result.error.issues[0].message }, 400);
    }
    const { packageIndex, email } = result.data;
    const pkg = dataPrice[packageIndex];

    const durationDays = Math.floor((pkg.time + (pkg.bonus ?? 0)) / 86_400);
    // message tampil di dashboard Saweria — dipakai untuk melacak toko & paket
    const message = `klerek-${claims.store_id}-${Date.now()}`;

    let donation;
    try {
      donation = await createDonation({
        amount: pkg.price,
        message,
        donatorName: `Toko ${claims.store_id}`,
        donatorEmail: email,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await sendLog(`🔴 GENERATE QRIS GAGAL\nToko: ${claims.store_id}\n${msg}`);
      console.error("Error creating Saweria donation:", err);
      throw Exception.ServerError();
    }

    // invoiceId = donation id Saweria, dipakai untuk cek status
    const created = await createPendingPayment({
      invoiceId: donation.id,
      storeId: claims.store_id,
      amount: pkg.price,
      durationDays,
      qrString: donation.qrString,
      note: message,
    });

    return c.json<ApiResponse<typeof created>>({ success: true, data: created }, 201);
  })

  // GET /payment/:invoiceId — cek status payment.
  // Tidak ada webhook dari Saweria: status di-poll aktif ke Saweria selama masih pending.
  .get("/:invoiceId", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const invoiceId = c.req.param("invoiceId");
    let p = await getPaymentByInvoiceId(invoiceId);

    if (!p) throw Exception.NotFound();
    if (p.storeId !== claims.store_id) throw Exception.Unauthorized();

    if (p.status === "pending") {
      let status: Awaited<ReturnType<typeof checkDonationStatus>> = "PENDING";
      try {
        status = await checkDonationStatus(invoiceId);
      } catch (err) {
        // Gagal cek ke Saweria bukan alasan menandai expired — biarkan frontend retry
        console.error("Error checking Saweria status:", err);
      }

      if (status === "SUCCESS") {
        const result = await fulfillPayment(invoiceId, new Date());
        if (result) {
          p = result.payment;
          await sendLog(
            `✅ PEMBAYARAN BERHASIL\nToko: ${result.payment.storeId}\nNominal: Rp${result.payment.amount.toLocaleString("id-ID")}\nAktif hingga: ${result.subscription.expiresAt.toLocaleDateString("id-ID")}`,
          );
        }
      } else if (isPaymentExpired(p)) {
        p = await expirePayment(invoiceId);
      }
    }

    return c.json<ApiResponse<typeof p>>({ success: true, data: p });
  });
