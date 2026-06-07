CREATE TABLE IF NOT EXISTS "learning_baselines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id"),
  "agent_id" text NOT NULL,
  "baseline" jsonb NOT NULL,
  "events" jsonb,
  "status" text DEFAULT 'pending_review' NOT NULL,
  "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "learning_baselines_workspace_agent_idx"
  ON "learning_baselines" ("workspace_id", "agent_id");

CREATE TABLE IF NOT EXISTS "learning_outlier_labels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "baseline_id" uuid NOT NULL REFERENCES "learning_baselines"("id") ON DELETE CASCADE,
  "event_id" text NOT NULL,
  "label" text NOT NULL,
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "learning_outlier_labels_baseline_event_idx"
  ON "learning_outlier_labels" ("baseline_id", "event_id");
