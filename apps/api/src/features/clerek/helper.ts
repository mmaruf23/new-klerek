import type { Summary, Data } from '@packages/contract';
import type { Row } from './type.js';
import { Exception } from '../../error.js';

export const query = `SELECT ts.user_id,
ts.cash,
ts.change_pay,
substr(ts.faktur, - 4) as bill_no,
tr.sort_no,
tr.plu,
tr.qty,
tr.date_tx,
tr.trans_time as time_tx,
ts.faktur,
ts.cust_id as no_member,
si.member_name,
ts.phone,
si.branch_id,
ts.store_id,
si.store_name,
lr.header,
lr.body1 as body,
lr.addtl1 as addtl,
lr.footer 
FROM tx_tsale ts 
LEFT JOIN tx_trans tr ON tr.bill_no = substr(ts.faktur, -4) 
LEFT JOIN log_receipt_prn lr ON tr.bill_no = lr.bill_no 
LEFT JOIN tx_usi si ON lr.nota_enc = substr(si.faktur, -4) 
WHERE ts.user_id = ? 
AND substr(ts.faktur, 5, 4) = ?`;

export const parseFakturPrefix = (d: string): string => {
  const [, month, date] = d.split('-');
  return `${date}${month}`;
};

export const mapToResponseObject = (rows: Row[]): Summary => {
  const recap =
    rows.find((r) => r.store_name != undefined) ||
    rows.find((r) => r.store_id != undefined);

  const result: Summary = {
    branch_id: recap?.branch_id || '----',
    user_id: recap?.user_id || '--------',
    store_id: recap?.store_id || '----',
    store_name: recap?.store_name || 'STORE NAME [?]',
    date_tx: recap?.date_tx || '-',
    data: [],
    total_faktur: 0,
  };
  const map = new Map<string, Data>();
  rows.forEach((row) => {
    if (!map.has(row.bill_no)) {
      const sale: Data = {
        faktur: {
          bill_no: row.bill_no,
          no_faktur: row.faktur,
        },
        member: {
          member_name: row.member_name,
          no_member: row.no_member,
          phone: row.phone,
        },
        cash: row.cash - row.change_pay,
        time_tx: row.time_tx,
        items: [],
        header: row.header,
        body: row.body,
        addtl: row.addtl,
        footer: row.footer,
      };

      map.set(row.bill_no, sale);
      result.data.push(sale);
      result.total_faktur += row.cash - row.change_pay;
    }

    const faktur = map.get(row.bill_no);
    if (!faktur) throw Exception.ServerError();

    faktur.items.push({
      sort_no: row.sort_no,
      plu: row.plu,
      qty: row.qty,
    });
  });

  return result;
};

export const isValidUserID = (s: string) => {
  return /^(?=[0-9]).{8}$/.test(s);
};
