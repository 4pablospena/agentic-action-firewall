import anomalyResultSchema from "../anomaly-result.schema.json" with { type: "json" };
import auditEntrySchema from "../audit-entry.schema.json" with { type: "json" };
import baselineSchema from "../baseline.schema.json" with { type: "json" };
import commonDefs from "../common.defs.json" with { type: "json" };
import eventSchema from "../event.schema.json" with { type: "json" };
import policySchema from "../policy.schema.json" with { type: "json" };

const SCHEMAS = {
  "anomaly-result.schema.json": anomalyResultSchema,
  "audit-entry.schema.json": auditEntrySchema,
  "baseline.schema.json": baselineSchema,
  "common.defs.json": commonDefs,
  "event.schema.json": eventSchema,
  "policy.schema.json": policySchema,
};

/** @param {keyof typeof SCHEMAS | string} filename */
export function loadSchemaJson(filename) {
  const schema = SCHEMAS[filename];
  if (!schema) {
    throw new Error(`Unknown schema file: ${filename}`);
  }
  return schema;
}
