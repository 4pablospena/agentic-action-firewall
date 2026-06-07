import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AuditEntry } from "@agent-firewall/core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  oauthProvider: text("oauth_provider").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  signingPublicKey: text("signing_public_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().default("owner"),
});

export const auditEntries = pgTable("audit_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  entryId: text("entry_id").notNull(),
  payload: jsonb("payload").$type<AuditEntry>().notNull(),
  ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
});

export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  yaml: text("yaml").notNull(),
  version: text("version"),
  validatedAt: timestamp("validated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const killSwitchEvents = pgTable("kill_switch_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  scope: text("scope").notNull(),
  reason: text("reason").notNull(),
  activatedBy: uuid("activated_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const approvalResponses = pgTable("approval_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  auditEntryId: uuid("audit_entry_id")
    .notNull()
    .references(() => auditEntries.id),
  approverId: uuid("approver_id")
    .notNull()
    .references(() => users.id),
  approved: boolean("approved").notNull(),
  mfaVerified: boolean("mfa_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const learningBaselines = pgTable("learning_baselines", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  agentId: text("agent_id").notNull(),
  baseline: jsonb("baseline").$type<import("@agent-firewall/core").BehaviorBaseline>().notNull(),
  events: jsonb("events").$type<import("@agent-firewall/core").ObservationEvent[]>(),
  status: text("status").notNull().default("pending_review"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const learningOutlierLabels = pgTable(
  "learning_outlier_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    baselineId: uuid("baseline_id")
      .notNull()
      .references(() => learningBaselines.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull(),
    label: text("label").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("learning_outlier_labels_baseline_event_idx").on(
      table.baselineId,
      table.eventId,
    ),
  ],
);
