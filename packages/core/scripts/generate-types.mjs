#!/usr/bin/env node
/**
 * Generates TypeScript types from JSON Schemas in /schemas.
 * Run: pnpm generate:types (from root) or pnpm generate:types (from packages/core)
 */
import { compileFromFile } from "json-schema-to-typescript";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreRoot = join(__dirname, "..");
const schemasDir = join(coreRoot, "..", "..", "schemas");
const outDir = join(coreRoot, "src", "generated");

const SCHEMA_FILES = [
  "event.schema.json",
  "anomaly-result.schema.json",
  "audit-entry.schema.json",
  "baseline.schema.json",
  "policy.schema.json",
];

const FILE_BANNER =
  "/* eslint-disable */\n/** Generated from JSON Schema — do not edit. Run: pnpm generate:types */\n\n";

async function main() {
  await mkdir(outDir, { recursive: true });

  const indexExports = [];

  for (const schemaFile of SCHEMA_FILES) {
    const schemaPath = join(schemasDir, schemaFile);
    const baseName = schemaFile.replace(".schema.json", "");
    const outFile = join(outDir, `${baseName}.ts`);

    const ts = await compileFromFile(schemaPath, {
      cwd: schemasDir,
      bannerComment: "",
      additionalProperties: false,
      enableConstEnums: true,
    });

    await writeFile(outFile, FILE_BANNER + ts, "utf8");
    indexExports.push(`export type * from "./${baseName}.js";`);
    console.log(`✓ ${baseName}.ts`);
  }

  await writeFile(
    join(outDir, "index.ts"),
    FILE_BANNER + indexExports.join("\n") + "\n",
    "utf8",
  );
  console.log("✓ index.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
