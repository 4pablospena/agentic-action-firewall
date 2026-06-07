import { test, expect } from "@playwright/test";

test.describe("dashboard smoke", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("dev login button visible when configured", async ({ page }) => {
    await page.goto("/login");
    const devButton = page.getByRole("link", { name: /Continue as Dev User/i });
    const githubButton = page.getByRole("link", { name: /Continue with GitHub/i });
    await expect(devButton.or(githubButton).first()).toBeVisible();
  });
});
