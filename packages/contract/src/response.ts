export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string | null;
  page?: Page;
}

interface Page {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

interface Item {
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

export interface StoreResponse {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
  subs: {
    id: number;
    createdAt: Date;
    storeId: string;
    expiresAt: Date;
    isTrial: boolean | null;
  }[];
}
