import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_ROOT = join(__dirname, "..");

function loadJson(filename) {
  return JSON.parse(readFileSync(join(SCHEMA_ROOT, filename), "utf8"));
}

let auditValidator;

function getAuditValidator() {
  if (auditValidator) {
    return auditValidator;
  }

  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    validateSchema: true,
  });
  addFormats(ajv);
  ajv.addSchema(loadJson("common.defs.json"));
  ajv.addSchema(loadJson("audit-entry.schema.json"));

  const validate = ajv.getSchema(
    "https://agent-firewall.dev/schemas/audit-entry.schema.json",
  );
  if (!validate) {
    throw new Error("audit-entry.schema.json validator not registered");
  }

  auditValidator = validate;
  return validate;
}

/**
 * @param {unknown} document
 * @returns {{ valid: true; data: unknown } | { valid: false; errors: Array<{ path: string; message: string }> }}
 */
export function validateAuditEntry(document) {
  const validate = getAuditValidator();
  const valid = validate(document);
  if (valid) {
    return { valid: true, data: document };
  }

  return {
    valid: false,
    errors: (validate.errors ?? []).map((err) => ({
      path: err.instancePath || "/",
      message: err.message ?? "validation failed",
    })),
  };
}
