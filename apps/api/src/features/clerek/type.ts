export interface Row {
  user_id: string;
  cash: number;
  change_pay: number;
  faktur: string;
  bill_no: string;
  sort_no: number;
  plu: number;
  qty: number;
  no_member: string;
  member_name: string;
  branch_id: string | undefined;
  store_id: string;
  store_name: string | undefined;

  date_tx: string;
  time_tx: string;
  phone: string;
  header: string;
  body: string;
  addtl: string;
  footer: string;
}
