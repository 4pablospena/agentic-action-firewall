import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadSchemaJson } from "./load-schema.mjs";

export class PolicyValidationError extends Error {
  /**
   * @param {string} message
   * @param {string} [label]
   * @param {Array<{ path: string; message: string }>} [errors]
   */
  constructor(message, label, errors = []) {
    super(message);
    this.name = "PolicyValidationError";
    this.label = label;
    this.errors = errors;
  }
}

function createValidator() {
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    validateSchema: true,
  });
  addFormats(ajv);

  ajv.addSchema(loadSchemaJson("common.defs.json"));

  for (const schemaFile of [
    "event.schema.json",
    "anomaly-result.schema.json",
    "audit-entry.schema.json",
    "baseline.schema.json",
    "policy.schema.json",
  ]) {
    ajv.addSchema(loadSchemaJson(schemaFile));
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
export function validatePolicy(document) {
  const valid = policyValidator(document);
  if (valid) {
    return { valid: true, data: document };
  }

  return {
    valid: false,
    errors: (policyValidator.errors ?? []).map(formatAjvError),
  };
}

/**
 * @param {unknown} document
 * @param {string} [label]
 * @returns {unknown}
 */
export function assertValidPolicy(document, label = "policy") {
  const result = validatePolicy(document);
  if (result.valid) {
    return result.data;
  }

  const summary = result.errors
    .map((e) => `${e.path} ${e.message}`)
    .join("; ");
  throw new PolicyValidationError(
    `Invalid ${label}: ${summary}`,
    label,
    result.errors,
  );
}

/**
 * @param {Array<{ path: string; message: string }>} errors
 * @returns {string}
 */
export function formatPolicyErrors(errors) {
  return errors.map((e) => `  ${e.path} ${e.message}`).join("\n");
}
