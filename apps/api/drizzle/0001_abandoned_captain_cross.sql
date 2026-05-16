CREATE TYPE "public"."balance_type" AS ENUM('credit', 'debit');--> statement-breakpoint
ALTER TABLE "balance" ALTER COLUMN "amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "balance" ADD COLUMN "type" "balance_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "balance" ADD COLUMN "note" varchar(255);--> statement-breakpoint
ALTER TABLE "balance" ADD COLUMN "payment_id" integer;--> statement-breakpoint
ALTER TABLE "balance" ADD CONSTRAINT "balance_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE set null ON UPDATE no action;