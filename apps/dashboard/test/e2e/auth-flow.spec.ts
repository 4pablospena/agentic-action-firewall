import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

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

test.describe("dashboard auth flow", () => {
  test.beforeAll(() => {
    runScript("migrate.mjs");
    runScript("seed-demo.mjs", ["--force"]);
  });

  test("dev login, audit data, and logout", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Continue as Dev User/i }).click();
    await expect(page).toHaveURL(/\/audit/);
    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    await page.getByRole("button", { name: /Dev User/i }).click();
    await page.getByRole("menuitem", { name: /Log out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
