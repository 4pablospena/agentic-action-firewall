#!/usr/bin/env node
/**
 * Validates AAF schema fixtures against JSON Schemas.
 * Run: pnpm validate:schemas or node schemas/validate.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import yaml from "js-yaml";
import { formatPolicyErrors, validatePolicy } from "./lib/validate-policy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv2020({
  strict: true,
  allErrors: true,
  validateSchema: true,
});
addFormats(ajv);

function loadJson(filename) {
  return JSON.parse(readFileSync(join(__dirname, filename), "utf8"));
}

function loadYaml(filename) {
  return yaml.load(readFileSync(join(__dirname, filename), "utf8"));
}

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

const validations = [
  { label: "observation-event.example.json", schema: "event.schema.json", loader: () => loadJson("fixtures/observation-event.example.json") },
  { label: "anomaly-result.example.json", schema: "anomaly-result.schema.json", loader: () => loadJson("fixtures/anomaly-result.example.json") },
  { label: "anomaly-result.loop.example.json", schema: "anomaly-result.schema.json", loader: () => loadJson("fixtures/anomaly-result.loop.example.json") },
  { label: "anomaly-result.mass-action.example.json", schema: "anomaly-result.schema.json", loader: () => loadJson("fixtures/anomaly-result.mass-action.example.json") },
  { label: "audit-entry.example.json", schema: "audit-entry.schema.json", loader: () => loadJson("fixtures/audit-entry.example.json") },
  { label: "baseline.example.json", schema: "baseline.schema.json", loader: () => loadJson("fixtures/baseline.example.json") },
  { label: "firewall.example.yml", usePolicyLib: true, loader: () => loadYaml("fixtures/firewall.example.yml") },
];

let failed = false;

for (const { label, schema, loader, usePolicyLib } of validations) {
  const data = loader();

  if (usePolicyLib) {
    const result = validatePolicy(data);
    if (result.valid) {
      console.log(`✓ ${label}`);
    } else {
      failed = true;
      console.error(`✗ ${label}`);
      console.error(formatPolicyErrors(result.errors));
    }
    continue;
  }

  const validate = ajv.getSchema(`https://agent-firewall.dev/schemas/${schema}`);
  if (!validate) {
    console.error(`✗ Schema not registered: ${schema}`);
    failed = true;
    continue;
  }

  const valid = validate(data);

  if (valid) {
    console.log(`✓ ${label}`);
  } else {
    failed = true;
    console.error(`✗ ${label}`);
    for (const err of validate.errors ?? []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
      if (err.params) console.error(`    ${JSON.stringify(err.params)}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("\nAll fixtures valid.");
