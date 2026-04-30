CREATE TABLE IF NOT EXISTS "store" (
    "id" varchar(4) PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "branch_id" varchar(4),
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
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
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "name" varchar(255) NOT NULL,
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_username_unique" UNIQUE ("username")
);
--> statement-breakpoint
ALTER TABLE "subscription"
ADD CONSTRAINT "subscription_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store" ("id") ON DELETE cascade ON UPDATE no action;