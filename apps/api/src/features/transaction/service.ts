import type { Data, TransactionDetail, TransactionListItem, TransactionQueryInput } from "@packages/contract";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/client.js";
import { store, transaction, type TransactionInsert } from "../../db/schema.js";
import { Exception } from "../../error.js";

interface SaveParams {
  storeId: string;
  userId: string;
  /** format YYYY-MM-DD, diambil dari nama file .db */
  dateTx: string;
  data: Data[];
}

// Postgres membatasi 65535 parameter per statement; 1 baris = 17 kolom.
const CHUNK_SIZE = 200;

const trunc = (v: string | null | undefined, max: number): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
};

const toRow = (params: SaveParams, sale: Data): TransactionInsert | null => {
  const noFaktur = trunc(sale.faktur?.no_faktur, 32);
  const billNo = trunc(sale.faktur?.bill_no, 8);
  if (!noFaktur || !billNo) return null;

  return {
    storeId: params.storeId,
    userId: params.userId,
    dateTx: params.dateTx,
    billNo,
    noFaktur,
    cash: Math.round(sale.cash) || 0,
    timeTx: trunc(sale.time_tx, 16),
    memberNo: trunc(sale.member?.no_member, 32),
    memberName: trunc(sale.member?.member_name, 255),
    memberPhone: trunc(sale.member?.phone, 32),
    header: sale.header ?? null,
    body: sale.body ?? null,
    addtl: sale.addtl ?? null,
    footer: sale.footer ?? null,
    items: sale.items ?? [],
  };
};

/**
 * Simpan transaksi hasil upload. Idempotent — upload ulang file yang sama
 * tidak menggandakan baris (unique store_id + date_tx + no_faktur).
 * Data ini tidak permanen, retensi 3 bulan.
 */
export const saveTransactions = async (params: SaveParams): Promise<number> => {
  const seen = new Set<string>();
  const rows: TransactionInsert[] = [];

  for (const sale of params.data) {
    const row = toRow(params, sale);
    if (!row || seen.has(row.noFaktur)) continue;
    seen.add(row.noFaktur);
    rows.push(row);
  }

  if (!rows.length) return 0;

  let saved = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const result = await db
      .insert(transaction)
      .values(rows.slice(i, i + CHUNK_SIZE))
      .onConflictDoNothing({
        target: [transaction.storeId, transaction.dateTx, transaction.noFaktur],
      });
    saved += result.rowCount ?? 0;
  }

  return saved;
};

// ---------------------------------------------------------------------------
// Riwayat transaksi
// ---------------------------------------------------------------------------

interface ListParams extends TransactionQueryInput {
  /** batasi hasil ke toko-toko ini. undefined = semua toko (admin) */
  allowedStoreIds?: string[];
}

/** `%` dan `_` adalah wildcard LIKE — escape supaya dianggap literal */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

const listColumns = {
  id: transaction.id,
  storeId: transaction.storeId,
  storeName: store.name,
  userId: transaction.userId,
  dateTx: transaction.dateTx,
  billNo: transaction.billNo,
  noFaktur: transaction.noFaktur,
  cash: transaction.cash,
  timeTx: transaction.timeTx,
  memberNo: transaction.memberNo,
  memberName: transaction.memberName,
  itemCount: sql<number>`jsonb_array_length(${transaction.items})`,
  createdAt: transaction.createdAt,
};

const buildFilter = (params: ListParams): SQL | undefined => {
  const filters: (SQL | undefined)[] = [];

  if (params.allowedStoreIds) filters.push(inArray(transaction.storeId, params.allowedStoreIds));
  if (params.storeId) filters.push(eq(transaction.storeId, params.storeId));
  if (params.userId) filters.push(eq(transaction.userId, params.userId));

  if (params.date) {
    filters.push(eq(transaction.dateTx, params.date));
  } else {
    if (params.from) filters.push(gte(transaction.dateTx, params.from));
    if (params.to) filters.push(lte(transaction.dateTx, params.to));
  }

  if (params.q) {
    const term = `%${escapeLike(params.q)}%`;
    filters.push(
      or(
        ilike(transaction.noFaktur, term),
        ilike(transaction.billNo, term),
        ilike(transaction.memberName, term),
        ilike(transaction.memberNo, term),
        ilike(transaction.memberPhone, term),
        ilike(store.name, term),
      ),
    );
  }

  const active = filters.filter((f): f is SQL => f !== undefined);
  return active.length ? and(...active) : undefined;
};

export const listTransactions = async (params: ListParams) => {
  const { limit, offset } = params;

  // user tanpa toko sama sekali — tidak perlu query
  if (params.allowedStoreIds && !params.allowedStoreIds.length) {
    return { data: [] as TransactionListItem[], total: 0, limit, offset, hasNext: false };
  }

  const where = buildFilter(params);
  const dir = params.sort === "oldest" ? asc : desc;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(transaction)
      .innerJoin(store, eq(store.id, transaction.storeId))
      .where(where),
    db
      .select(listColumns)
      .from(transaction)
      .innerJoin(store, eq(store.id, transaction.storeId))
      .where(where)
      .orderBy(dir(transaction.dateTx), dir(transaction.timeTx), dir(transaction.id))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const data: TransactionListItem[] = rows.map((r) => ({
    ...r,
    itemCount: Number(r.itemCount ?? 0),
  }));

  return { data, total, limit, offset, hasNext: offset + limit < total };
};

/** Detail lengkap termasuk teks struk dan daftar item. */
export const getTransactionDetail = async (id: number): Promise<TransactionDetail> => {
  const [row] = await db
    .select({
      ...listColumns,
      memberPhone: transaction.memberPhone,
      header: transaction.header,
      body: transaction.body,
      addtl: transaction.addtl,
      footer: transaction.footer,
      items: transaction.items,
    })
    .from(transaction)
    .innerJoin(store, eq(store.id, transaction.storeId))
    .where(eq(transaction.id, id))
    .limit(1);

  if (!row) throw Exception.NotFound("Transaksi tidak ditemukan");

  return {
    ...row,
    itemCount: Number(row.itemCount ?? 0),
    items: row.items ?? [],
  };
};
