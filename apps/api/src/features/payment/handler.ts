import { Hono } from "hono";
import { generatePaymentSchema, dataPrice } from "@packages/contract";
import type { ApiResponse, JwtClaims } from "@packages/contract";
import { cookieMiddleware } from "../auth/middleware.js";
import { createDonation, verifyWebhookToken, type SaweriaWebhookPayload } from "../../utils/saweria.js";
import { getStorePublicInfo } from "../store/service.js";
import {
  createPendingPayment,
  getPaymentByInvoiceId,
  getPaymentsByStoreId,
  findReusablePendingPayment,
  fulfillPayment,
  expirePayment,
  isPaymentExpired,
} from "./service.js";
import { Exception } from "../../error.js";
import { sendLog } from "../../utils/telegram.js";

export const paymentHandler = new Hono()

  // GET /payment — daftar payment milik store yang login (belum dipakai FE)
  .get("/", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const payments = await getPaymentsByStoreId(claims.store_id);
    return c.json<ApiResponse<typeof payments>>({
      success: true,
      data: payments,
    });
  })

  // POST /payment/generate — buat donasi QRIS di Saweria. Public: siapa pun boleh membayar untuk toko mana pun.
  // Body: { storeId, packageIndex, email }
  .post("/generate", async (c) => {
    const result = generatePaymentSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!result.success) {
      return c.json({ success: false, message: result.error.issues[0].message }, 400);
    }
    const { storeId, packageIndex, email } = result.data;
    const pkg = dataPrice[packageIndex];

    const store = await getStorePublicInfo(storeId);
    if (!store) throw Exception.NotFound("Toko tidak ditemukan");

    // Anti-spam + UX: pakai ulang QR yang masih berlaku alih-alih buat donasi baru
    const existing = await findReusablePendingPayment(storeId, pkg.price);
    if (existing) {
      return c.json<ApiResponse<typeof existing>>({ success: true, data: existing });
    }

    const durationDays = Math.floor((pkg.time + (pkg.bonus ?? 0)) / 86_400);
    // message tampil di dashboard Saweria — dipakai untuk melacak toko & paket
    const message = `klerek-${storeId}-${Date.now()}`;

    let donation;
    try {
      donation = await createDonation({
        amount: pkg.price,
        message,
        donatorName: `Toko ${storeId}`,
        donatorEmail: email,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await sendLog(`🔴 GENERATE QRIS GAGAL\nToko: ${storeId}\n${msg}`);
      console.error("Error creating Saweria donation:", err);
      throw Exception.ServerError();
    }

    // invoiceId = donation id Saweria — dicocokkan dengan `id` di payload webhook
    const created = await createPendingPayment({
      invoiceId: donation.id,
      storeId,
      amount: pkg.price,
      durationDays,
      qrString: donation.qrString,
      note: message,
    });

    return c.json<ApiResponse<typeof created>>({ success: true, data: created }, 201);
  })

  // GET /payment/:invoiceId — cek status payment (dari DB; status diperbarui oleh webhook).
  // Public: invoiceId adalah UUID Saweria, tidak bisa ditebak.
  .get("/:invoiceId", async (c) => {
    const invoiceId = c.req.param("invoiceId");
    let p = await getPaymentByInvoiceId(invoiceId);
    if (!p) throw Exception.NotFound();

    if (isPaymentExpired(p)) p = await expirePayment(invoiceId);

    return c.json<ApiResponse<typeof p>>({ success: true, data: p });
  })

  // POST /payment/webhook?token=... — dipanggil Saweria setiap ada donasi masuk.
  // Selalu balas 200 setelah token valid agar Saweria tidak retry untuk kasus yang memang diabaikan.
  .post("/webhook", async (c) => {
    if (!verifyWebhookToken(c.req.query("token"))) {
      await sendLog("🔴 WEBHOOK SAWERIA: token tidak valid");
      throw Exception.Unauthorized();
    }

    const body = await c.req.json<SaweriaWebhookPayload>().catch(() => null);
    if (!body?.id) throw Exception.BadRequest("payload tidak valid");

    const p = await getPaymentByInvoiceId(body.id);
    if (!p) {
      // Donasi langsung lewat halaman Saweria (bukan dari aplikasi) — abaikan
      await sendLog(
        `ℹ️ DONASI TANPA PAYMENT\nDari: ${body.donator_name} <${body.donator_email}>\nNominal: Rp${body.amount_raw.toLocaleString("id-ID")}\nPesan: ${body.message ?? "-"}`,
      );
      return c.json({ success: true });
    }

    if (body.amount_raw < p.amount) {
      await sendLog(
        `⚠️ NOMINAL DONASI KURANG\nToko: ${p.storeId}\nInvoice: ${p.invoiceId}\nDiterima: Rp${body.amount_raw.toLocaleString("id-ID")} < Rp${p.amount.toLocaleString("id-ID")}`,
      );
      return c.json({ success: true });
    }

    const result = await fulfillPayment(body.id, new Date(body.created_at || Date.now()));
    if (result) {
      await sendLog(
        `✅ PEMBAYARAN BERHASIL\nToko: ${result.payment.storeId}\nNominal: Rp${result.payment.amount.toLocaleString("id-ID")}\nAktif hingga: ${result.subscription.expiresAt.toLocaleDateString("id-ID")}`,
      );
    }

    return c.json({ success: true });
  });
