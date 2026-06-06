import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { d as defineEventHandler, r as requireSessionUser, b as readBody, c as createError, u as useDb, p as policies } from '../../../nitro/nitro.mjs';
import yaml from 'js-yaml';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import 'drizzle-orm';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'consola';
import 'node:module';

const __dirname$1 = dirname(fileURLToPath(globalThis._importMeta_.url));
const SCHEMA_ROOT = join(__dirname$1, "..");

function loadJson(filename) {
  return JSON.parse(readFileSync(join(SCHEMA_ROOT, filename), "utf8"));
}

function createValidator() {
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    validateSchema: true,
  });
  addFormats(ajv);

  ajv.addSchema(loadJson("common.defs.json"));

  for (const schemaFile of [
    "event.schema.json",
    "anomaly-result.schema.json",
    "audit-entry.schema.json",
    "baseline.schema.json",
    "policy.schema.json",
  ]) {
    ajv.addSchema(loadJson(schemaFile));
  }

  const validate = ajv.getSchema("https://agent-firewall.dev/schemas/policy.schema.json");
  if (!validate) {
    throw new Error("policy.schema.json validator not registered");
  }

  return validate;
}

const policyValidator = createValidator();

/**
 * @param {import("ajv").ErrorObject} err
 * @returns {{ path: string; message: string }}
 */
function formatAjvError(err) {
  return {
    path: err.instancePath || "/",
    message: err.message ?? "validation failed",
  };
}

/**
 * @param {unknown} document
 * @returns {{ valid: true; data: unknown } | { valid: false; errors: Array<{ path: string; message: string }> }}
 */
function validatePolicy(document) {
  const valid = policyValidator(document);
  if (valid) {
    return { valid: true, data: document };
  }

  return {
    valid: false,
    errors: (policyValidator.errors ?? []).map(formatAjvError),
  };
}

const index_post = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const body = await readBody(event);
  if (!body.yaml || typeof body.yaml !== "string") {
    throw createError({ statusCode: 400, statusMessage: "yaml is required" });
  }
  let document;
  try {
    document = yaml.load(body.yaml);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid YAML" });
  }
  const result = validatePolicy(document);
  if (!result.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Policy validation failed",
      data: result.errors
    });
  }
  const policy = result.data;
  const db = useDb();
  const [row] = await db.insert(policies).values({
    workspaceId: user.workspaceId,
    yaml: body.yaml,
    version: policy.version
  }).returning();
  return { policy: row };
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
