import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, type Page } from "@playwright/test";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const baselineFixture = JSON.parse(
  readFileSync(join(appRoot, "../../schemas/fixtures/baseline.example.json"), "utf8"),
);

function sectionCard(page: Page, title: string) {
  return page.getByRole("heading", { name: title }).locator("xpath=../..");
}

test.describe("learning mode review flow", () => {
  test("upload baseline and complete review sections", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Continue as Dev User/i }).click();
    await expect(page).toHaveURL(/\/audit/);

    await page.goto("/learning");
    await expect(page.getByRole("heading", { name: "Upload baseline" })).toBeVisible();

    await page.locator("#agent-id").fill(baselineFixture.agent_id);
    await page.locator("#baseline-json").fill(JSON.stringify(baselineFixture, null, 2));

    await Promise.all([
      page.waitForURL(new RegExp(`/learning/review/${baselineFixture.agent_id}`)),
      page.getByRole("button", { name: /Upload & review/i }).click(),
    ]);

    await expect(page.getByRole("heading", { name: "Section 1 — Summary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Section 2 — Recommended policies" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Section 3 — Detected outliers" })).toBeVisible();

    const policiesCard = sectionCard(page, "Section 2 — Recommended policies");
    await expect(policiesCard.getByText("gmail.send", { exact: true })).toBeVisible();
    await expect(policiesCard.getByText("linkedin.connect", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Approve & activate policies/i }).click();
    await expect(page.getByRole("alert")).toContainText(/Review approved/i);
  });
});
