CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "oauth_provider" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspaces" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id"),
  "signing_public_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_members" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "role" text DEFAULT 'owner' NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
  "entry_id" text NOT NULL,
  "payload" jsonb NOT NULL,
  "ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
  "yaml" text NOT NULL,
  "version" text,
  "validated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "kill_switch_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
  "scope" text NOT NULL,
  "reason" text NOT NULL,
  "activated_by" uuid NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "approval_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "audit_entry_id" uuid NOT NULL REFERENCES "audit_entries"("id"),
  "approver_id" uuid NOT NULL REFERENCES "users"("id"),
  "approved" boolean NOT NULL,
  "mfa_verified" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
