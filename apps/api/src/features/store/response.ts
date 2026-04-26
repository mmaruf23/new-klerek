export type StoreResponse = {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
  subs: {
    id: number;
    createdAt: Date;
    storeId: string;
    expiresAt: Date;
  }[];
};
