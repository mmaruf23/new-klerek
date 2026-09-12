import { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

interface ApiResponse<T = null> {
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
interface Data {
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
interface Summary {
    branch_id: string;
    store_id: string;
    store_name: string;
    user_id: string;
    date_tx: string;
    data: Data[];
    total_faktur: number;
}
interface StoreResponse {
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

declare const time: {
    MINUTE: number;
    HOUR: number;
    DAY: number;
};

interface JwtClaims extends JwtPayload {
    readonly store_id?: string;
    readonly sub?: string;
    readonly name?: string;
    readonly role?: "superadmin" | "admin" | "user";
    readonly type?: "access" | "refresh";
}

declare const googleAuthSchema: z.ZodObject<{
    credential: z.ZodString;
}, z.core.$strip>;
declare const referStoreSchema: z.ZodObject<{
    referralCode: z.ZodString;
}, z.core.$strip>;
type ReferStoreInput = z.infer<typeof referStoreSchema>;
type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
interface ReferredStore {
    id: string;
    name: string;
    branchId: string | null;
    createdAt: Date;
}
interface ProfileResponse {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    referralCode: string | null;
    referredStores: ReferredStore[];
    totalBalance: number;
}
interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: "admin" | "user" | "superadmin";
    };
    token: string;
}
interface RefreshResponse {
    token: string;
}
interface ReferStoreResponse {
    storeId: string;
    storeName: string;
    referrerName: string;
}
interface AdminUserItem {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: "user" | "admin" | "superadmin";
    referralCode: string | null;
    totalBalance: number;
    referredStoreCount: number;
    createdAt: Date;
}
interface AdminUserDetail extends AdminUserItem {
    referredStores: ReferredStore[];
}
declare const balanceAdjustSchema: z.ZodObject<{
    type: z.ZodEnum<{
        credit: "credit";
        debit: "debit";
    }>;
    amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type BalanceAdjustInput = z.infer<typeof balanceAdjustSchema>;
declare const roleUpdateSchema: z.ZodObject<{
    role: z.ZodEnum<{
        admin: "admin";
        user: "user";
    }>;
}, z.core.$strip>;
type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;

interface SubscriptionPackage {
    price: number;
    time: number;
    bonus?: number;
    name: string;
    desc: string;
    badge?: 'POPULER' | 'HEMAT';
}
declare const dataPrice: SubscriptionPackage[];

export { type AdminUserDetail, type AdminUserItem, type ApiResponse, type BalanceAdjustInput, type Data, type GoogleAuthInput, type JwtClaims, type LoginResponse, type ProfileResponse, type ReferStoreInput, type ReferStoreResponse, type ReferredStore, type RefreshResponse, type RoleUpdateInput, type StoreResponse, type SubscriptionPackage, type Summary, balanceAdjustSchema, dataPrice, googleAuthSchema, referStoreSchema, roleUpdateSchema, time };
