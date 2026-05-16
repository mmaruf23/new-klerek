import { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

interface ApiResponse<T = null> {
    success: boolean;
    data?: T;
    message?: string | null;
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
}

declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
interface ReferredStore {
    id: string;
    name: string;
    branchId: string | null;
    createdAt: Date;
}
interface ProfileResponse {
    id: string;
    name: string;
    username: string;
    role: string;
    referralCode: string | null;
    referredStores: ReferredStore[];
    totalBalance: number;
}
interface LoginResponse {
    user: {
        id: string;
        name: string;
        username: string;
        role: "admin" | "user" | "superadmin";
    };
    token: string;
}
interface RegisterResponse {
    id: string;
    name: string;
    username: string;
    referralCode: string | null;
}

interface SubscriptionPackage {
    price: number;
    time: number;
    bonus?: number;
}
declare const dataPrice: SubscriptionPackage[];

export { type ApiResponse, type Data, type JwtClaims, type LoginInput, type LoginResponse, type ProfileResponse, type ReferredStore, type RegisterInput, type RegisterResponse, type StoreResponse, type SubscriptionPackage, type Summary, dataPrice, loginSchema, registerSchema, time };
