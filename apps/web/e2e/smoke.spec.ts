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

test("public routes render without dead ends", async ({ page }) => {
  const routes = [
    ["/login", /Welcome back/i],
    ["/signup", /Make money simple/i],
    ["/forgot-password", /Reset your password/i],
    ["/reset-password", /Choose a new password/i],
    ["/privacy", /Your data, treated with care/i],
    ["/terms", /Simple rules for a shared space/i],
    ["/missing-page", /This page moved on/i],
  ];

  for (const [path, heading] of routes) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("landing page does not overflow on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
