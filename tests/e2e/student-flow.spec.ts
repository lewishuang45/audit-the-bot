import { expect, test } from "@playwright/test";

test("student can join, lock baseline, and reach audit", async ({
  page,
  request,
}) => {
  await request.delete("/api/submissions");
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByLabel("Participant name").fill("Smoke Tester");
  await page.getByRole("button", { name: /join session/i }).click();

  await expect(page.getByText("CampusTea Spark Launch")).toBeVisible();
  await page.getByRole("button", { name: /start baseline/i }).click();

  await page
    .getByLabel("Baseline recommendation")
    .fill(
      "Launch Yuzu Green Tea Spark under HKD 18 with campus booths, student ambassadors, and targeted short-form content.",
    );
  await page.getByRole("button", { name: /lock baseline/i }).click();

  await expect(
    page.getByText("Identify what is wrong before asking for a rewrite"),
  ).toBeVisible();
  await page.getByRole("button", { name: /mark issue/i }).first().click();
  await expect(page.getByLabel("Issue category").first()).toBeVisible();
});
