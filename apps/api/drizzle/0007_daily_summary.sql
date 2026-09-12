CREATE TABLE "daily_summary" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "daily_summary_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"store_id" varchar(4) NOT NULL,
	"user_id" varchar(8) NOT NULL,
	"date_tx" date NOT NULL,
	"total_faktur" integer NOT NULL,
	"member_faktur" integer DEFAULT 0 NOT NULL,
	"total_cash" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_summary" ADD CONSTRAINT "daily_summary_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_summary_store_date_user_uq" ON "daily_summary" USING btree ("store_id","date_tx","user_id");