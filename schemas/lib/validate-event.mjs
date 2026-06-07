import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadSchemaJson } from "./load-schema.mjs";

let eventValidator;

function getEventValidator() {
  if (eventValidator) {
    return eventValidator;
  }

  const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true });
  addFormats(ajv);
  ajv.addSchema(loadSchemaJson("common.defs.json"));
  ajv.addSchema(loadSchemaJson("event.schema.json"));

  const validate = ajv.getSchema("https://agent-firewall.dev/schemas/event.schema.json");
  if (!validate) {
    throw new Error("event.schema.json validator not registered");
  }

  eventValidator = validate;
  return validate;
}

/** @param {unknown} document */
export function validateObservationEvent(document) {
  const validate = getEventValidator();
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
