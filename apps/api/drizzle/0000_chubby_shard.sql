CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'superadmin');
--> statement-breakpoint
CREATE TABLE "balance" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "balance_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "user_id" uuid NOT NULL,
    "amount" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "invoice_id" varchar(100) NOT NULL,
    "store_id" varchar(4) NOT NULL,
    "amount" integer NOT NULL,
    "duration_days" integer NOT NULL,
    "status" varchar(20) DEFAULT 'pending' NOT NULL,
    "qris_url" varchar(500),
    "note" varchar(255),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "paid_at" timestamp,
    CONSTRAINT "payment_invoice_id_unique" UNIQUE ("invoice_id")
);
--> statement-breakpoint
CREATE TABLE "store" (
    "id" varchar(4) PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "branch_id" varchar(4),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "referrer_id" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "subscription" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "store_id" varchar(4) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "name" varchar(255) NOT NULL,
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "role" "role" DEFAULT 'user' NOT NULL,
    "referal_code" varchar(10),
    CONSTRAINT "users_username_unique" UNIQUE ("username"),
    CONSTRAINT "users_referal_code_unique" UNIQUE ("referal_code")
);
--> statement-breakpoint
ALTER TABLE "balance"
ADD CONSTRAINT "balance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment"
ADD CONSTRAINT "payment_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "store"
ADD CONSTRAINT "store_referrer_id_users_referal_code_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users" ("referal_code") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "subscription"
ADD CONSTRAINT "subscription_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store" ("id") ON DELETE cascade ON UPDATE no action;