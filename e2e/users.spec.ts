import { test, expect } from "@playwright/test";

test("users page loads", async ({ page }) => {
  await page.goto("/users");
  await expect(page.getByText("John")).toBeVisible();
});
