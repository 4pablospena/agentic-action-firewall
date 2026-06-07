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

let baselineValidator;

function getBaselineValidator() {
  if (baselineValidator) {
    return baselineValidator;
  }

  const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true });
  addFormats(ajv);
  ajv.addSchema(loadJson("common.defs.json"));
  ajv.addSchema(loadJson("baseline.schema.json"));

  const validate = ajv.getSchema("https://agent-firewall.dev/schemas/baseline.schema.json");
  if (!validate) {
    throw new Error("baseline.schema.json validator not registered");
  }

  baselineValidator = validate;
  return validate;
}

/** @param {unknown} document */
export function validateBaseline(document) {
  const validate = getBaselineValidator();
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
