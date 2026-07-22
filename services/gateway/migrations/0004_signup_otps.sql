-- 0004: signup_otps — email-verified self-service signup.
--
-- Stores the OTP rows for the public /v1/signup/request + /v1/signup/confirm
-- flow (the only way a cold user can activate aedex). The stored code is
-- SHA-256 hashed (code_hash), never plaintext. Lifecycle: request upserts the
-- latest unconsumed row; confirm verifies the hash, burns the code after
-- MAX_OTP_ATTEMPTS wrong tries, and consumes (consumed_at) it on success or
-- expiry. expires_at = now() + 10m at issue time.
--
-- NOTE: drizzle-kit also flagged a pre-existing drift on tools.tags
-- (SET DATA TYPE text[]) that is unrelated to this feature and intentionally
-- omitted here so this migration stays scoped to signup.

CREATE TABLE "signup_otps" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "signup_otps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "signup_otps_email_idx" ON "signup_otps" USING btree ("email");
