import { type Locator, type Page, type TestInfo } from '@playwright/test';

export type Interest =
  | 'Babies and Kids'
  | 'Food and Dining'
  | 'Fashion and Accessories'
  | 'Santander Offers'
  | 'Health and Beauty'
  | 'Auto'
  | 'Gifts and Flowers'
  | 'Travel'
  | 'Entertainment'
  | 'Sports and Outdoors'
  | 'Home and Garden'
  | 'Tech & Electronics';

export class InterestPage {
  readonly page: Page;
  readonly continueButton: Locator;
  readonly notNowButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.notNowButton   = page.getByRole('button', { name: /not now/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/interest/, { timeout: 15000 });
    await this.continueButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  interest(name: Interest): Locator {
    return this.page.locator(`div[role="checkbox"][aria-label="${name}"]`);
  }

  async selectInterests(interests: Interest[]): Promise<void> {
    for (const name of interests) {
      await this.interest(name).click();
    }
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async skipForNow(): Promise<void> {
    await this.notNowButton.click();
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
