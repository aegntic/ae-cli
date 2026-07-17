-- 0002: per-call OUTCOME TELEMETRY table.
-- Adds run_events, the reliability data asset for reliability-weighted routing.
-- Cannot be backfilled later — ship before breadth. Writes are ADDITIVE and
-- purely observational: they never alter the charge/refund lifecycle or the
-- signed ledger. costMicros is a denormalized micro-USD copy of the ledger
-- charge amount for JOIN-free aggregation; authoritative cost stays in
-- balance_ledger.amount.
--
-- NOTE: the 0001 signed-chain columns (prev_hash, payload_hash, signature_*,
-- runs.result_hash) are intentionally NOT re-emitted here even though the
-- 0001_snapshot.json was missing from meta/. 0001_signed_chain.sql shipped
-- them with ADD COLUMN IF NOT EXISTS and they are already live on the DB.
-- Trimming the duplicate ALTERs avoids a spurious migration failure.

CREATE TABLE "run_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "run_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"run_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"provider" text NOT NULL,
	"endpoint" text NOT NULL,
	"latency_ms" integer NOT NULL,
	"http_status" integer,
	"success" boolean NOT NULL,
	"item_count" integer,
	"result_hash" text,
	"cost_micros" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "run_events" ADD CONSTRAINT "run_events_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_events" ADD CONSTRAINT "run_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "run_events_run_idx" ON "run_events" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "run_events_provider_endpoint_idx" ON "run_events" USING btree ("provider","endpoint");--> statement-breakpoint
CREATE INDEX "run_events_workspace_idx" ON "run_events" USING btree ("workspace_id");
