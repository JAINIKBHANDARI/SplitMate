import { test, expect } from "@playwright/test";

test("marketing navigation and interactive controls work", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Split bills/i }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /Get started free/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.goBack();

  await page.getByLabel("Next step").click();
  await expect(
    page.getByRole("heading", { name: "Choose the split" }),
  ).toBeVisible();

  const footer = page.locator("footer");
  await footer.getByRole("link", { name: "Privacy" }).click();
  await expect(
    page.getByRole("heading", { name: /Your data, treated with care/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Back to SplitMate/i }).click();
  await expect(
    page.getByRole("heading", { name: /Split bills/i }),
  ).toBeVisible();
});
