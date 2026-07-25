ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "is_trial" boolean DEFAULT true NOT NULL;
