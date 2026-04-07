import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class MyOffersPage {
  readonly page: Page;
  readonly favouritesTab: Locator;
  readonly activatedTab: Locator;
  readonly navigationBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.favouritesTab = page.getByRole('tab', { name: /favourites/i }).first();
    this.activatedTab  = page.getByRole('tab', { name: /activated/i }).first();
    this.navigationBar = page.locator('nav').first();
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/myRewards/, { timeout: 15000 });
    await this.favouritesTab.waitFor({ state: 'visible', timeout: 10000 });
  }

  async goToFavourites(): Promise<void> {
    await this.favouritesTab.click();
  }

  async goToActivated(): Promise<void> {
    await this.activatedTab.click();
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
