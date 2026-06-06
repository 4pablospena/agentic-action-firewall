import { test, expect } from "@playwright/test";

test.describe("dashboard smoke", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue with GitHub/i })).toBeVisible();
  });
});
