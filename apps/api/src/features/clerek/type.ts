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

export interface Item {
    sort_no: number;
    plu: number;
    qty: number;
}

export interface Data {
    member: {
        phone: string;
        no_member: string;
        member_name: string;
    };
    faktur: {
        bill_no: string;
        no_faktur: string;
    };
    cash: number;
    items: Item[];
    time_tx: string;
    header: string;
    body: string;
    addtl: string;
    footer: string;
}
export interface Summary {
    branch_id: string;
    store_id: string;
    store_name: string;
    user_id: string;
    date_tx: string;
    data: Data[];
    total_faktur: number;
}