import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class CategoryOffersPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly featuredOffersSection: Locator;
  readonly allOffersHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading           = page.locator('h1.MuiTypography-h1');
    this.featuredOffersSection = page.locator('[aria-label="Featured products carousel"]');
    this.allOffersHeading      = page.locator('h3').filter({ hasText: /All .* offers/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/offer-list\//, { timeout: 15000 });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getPageTitle(): Promise<string> {
    return (await this.pageHeading.textContent()) ?? '';
  }

  async hasNoErrors(): Promise<boolean> {
    const errorVisible = await this.page
      .locator('[role="alert"]')
      .filter({ hasText: /error|something went wrong|failed/i })
      .isVisible();
    return !errorVisible;
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
