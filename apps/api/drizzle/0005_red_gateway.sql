CREATE TABLE "transaction" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"store_id" varchar(4) NOT NULL,
	"user_id" varchar(8) NOT NULL,
	"date_tx" date NOT NULL,
	"bill_no" varchar(8) NOT NULL,
	"no_faktur" varchar(32) NOT NULL,
	"cash" integer NOT NULL,
	"time_tx" varchar(16),
	"member_no" varchar(32),
	"member_name" varchar(255),
	"member_phone" varchar(32),
	"header" text,
	"body" text,
	"addtl" text,
	"footer" text,
	"items" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_store_date_faktur_uq" ON "transaction" USING btree ("store_id","date_tx","no_faktur");--> statement-breakpoint
CREATE INDEX "transaction_store_date_idx" ON "transaction" USING btree ("store_id","date_tx");--> statement-breakpoint
CREATE INDEX "transaction_date_idx" ON "transaction" USING btree ("date_tx");