-- tools catalog: persisted marketplace surface (replaces in-memory registry
-- for discover/inspect). v1 = Postgres full-text search; v2 = pgvector.
CREATE TABLE "tools" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"path" text NOT NULL,
	"description" text NOT NULL,
	"input_schema" jsonb NOT NULL,
	"cost_model" jsonb NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"kind" text DEFAULT 'native' NOT NULL,
	-- Maintained by tools_search_tsv_trigger (below). Postgres array_to_string
	-- is STABLE not IMMUTABLE, so this column cannot be GENERATED ALWAYS AS.
	-- A trigger is the standard pattern for composite tsvector with non-
	-- immutable inputs. Never written by the client.
	"search_tsv" tsvector,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tools_provider_path_idx" ON "tools" USING btree ("provider","path");
--> statement-breakpoint
-- GIN over the tsvector powers full-text search (plainto_tsquery).
CREATE INDEX "tools_search_tsv_idx" ON "tools" USING gin ("search_tsv");
--> statement-breakpoint
-- Keep search_tsv in sync with provider + path + description + tags. Fires on
-- every INSERT and UPDATE so the catalog is always searchable after a seed.
CREATE OR REPLACE FUNCTION tools_rebuild_search_tsv() RETURNS trigger AS $$
BEGIN
	NEW.search_tsv :=
		to_tsvector('english',
			NEW.provider || ' ' ||
			NEW.path || ' ' ||
			NEW.description || ' ' ||
			array_to_string(NEW.tags, ' '));
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER tools_search_tsv_trigger
	BEFORE INSERT OR UPDATE ON "tools"
	FOR EACH ROW
	EXECUTE FUNCTION tools_rebuild_search_tsv();
