ALTER TABLE "payment" RENAME COLUMN "qris_url" TO "qr_string";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "qr_string" SET DATA TYPE text;
