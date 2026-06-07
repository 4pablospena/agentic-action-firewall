import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadSchemaJson } from "./load-schema.mjs";

let baselineValidator;

function getBaselineValidator() {
  if (baselineValidator) {
    return baselineValidator;
  }

  const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true });
  addFormats(ajv);
  ajv.addSchema(loadSchemaJson("common.defs.json"));
  ajv.addSchema(loadSchemaJson("baseline.schema.json"));

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
