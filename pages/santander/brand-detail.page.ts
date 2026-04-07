import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class BrandDetailPage {
  readonly page: Page;
  readonly offerCountHeading: Locator;
  readonly offersGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.offerCountHeading = page.locator('h3').filter({ hasText: /Offer.*available for/i });
    this.offersGrid        = page.locator('#grid-view');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/brand\//, { timeout: 15000 });
    await this.offerCountHeading.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getOfferCountText(): Promise<string> {
    return (await this.offerCountHeading.textContent()) ?? '';
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
