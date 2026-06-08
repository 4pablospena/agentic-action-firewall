import { test, expect } from "@playwright/test";

test.describe("dashboard auth flow", () => {
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
