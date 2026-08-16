import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

export const transactionQuerySchema = z
  .object({
    storeId: z.string().length(4, "Store ID harus 4 karakter").optional(),
    userId: z.string().max(8).optional(),
    /** tanggal tunggal — kalau diisi, `from`/`to` diabaikan */
    date: dateOnly.optional(),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
    /** cari di no faktur, bill no, nama/no/telepon member, dan nama toko */
    q: z.string().trim().min(1).max(100).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    sort: z.enum(["newest", "oldest"]).default("newest"),
  })
  .refine((v) => !v.from || !v.to || v.from <= v.to, {
    message: "Tanggal `from` tidak boleh lebih besar dari `to`",
    path: ["from"],
  });

export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;

export interface TransactionItem {
  sort_no: number;
  plu: number;
  qty: number;
}

export interface TransactionListItem {
  id: number;
  storeId: string;
  storeName: string;
  /** ID kasir yang mengunggah */
  userId: string;
  /** YYYY-MM-DD */
  dateTx: string;
  billNo: string;
  noFaktur: string;
  cash: number;
  timeTx: string | null;
  memberNo: string | null;
  memberName: string | null;
  itemCount: number;
  createdAt: Date;
}

export interface TransactionDetail extends TransactionListItem {
  memberPhone: string | null;
  header: string | null;
  body: string | null;
  addtl: string | null;
  footer: string | null;
  items: TransactionItem[];
}
