import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test, expect } from "@playwright/test";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const baselineFixture = JSON.parse(
  readFileSync(join(appRoot, "../../schemas/fixtures/baseline.example.json"), "utf8"),
);

function runScript(script: string, args: string[] = []) {
  const result = spawnSync(process.execPath, [join(appRoot, "scripts", script), ...args], {
    cwd: appRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed with status ${result.status}`);
  }
}

test.describe("learning mode review flow", () => {
  test.beforeAll(() => {
    runScript("migrate.mjs");
    runScript("seed-demo.mjs", ["--force"]);
  });

  test("upload baseline and complete review sections", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Continue as Dev User/i }).click();

    await page.goto("/learning");
    await expect(page.getByText("Upload baseline")).toBeVisible();

    await page.locator("#agent-id").fill(baselineFixture.agent_id);
    await page.locator("#baseline-json").fill(JSON.stringify(baselineFixture, null, 2));
    await page.getByRole("button", { name: /Upload & review/i }).click();

    await expect(page).toHaveURL(new RegExp(`/learning/review/${baselineFixture.agent_id}`));
    await expect(page.getByText("Section 1 — Summary")).toBeVisible();
    await expect(page.getByText("Section 2 — Recommended policies")).toBeVisible();
    await expect(page.getByText("Section 3 — Detected outliers")).toBeVisible();
    await expect(page.getByText("gmail.send")).toBeVisible();

    await page.getByRole("button", { name: /Approve & activate policies/i }).click();
    await expect(page.getByText(/Review approved/i)).toBeVisible();
  });
});
