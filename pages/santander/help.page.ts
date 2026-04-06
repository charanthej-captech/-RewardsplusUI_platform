import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class HelpPage {
  readonly page: Page;
  readonly navigationBar: Locator;
  readonly gettingStartedAccordion: Locator;
  readonly cashbackAccordion: Locator;
  readonly voucherCodesAccordion: Locator;
  readonly prizeDrawsAccordion: Locator;
  readonly privacyAccordion: Locator;
  readonly accountServicesAccordion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationBar           = page.locator('nav#footerContainer');
    this.gettingStartedAccordion = page.getByText('Getting Started');
    this.cashbackAccordion       = page.getByText('Cashback');
    this.voucherCodesAccordion   = page.getByText('Voucher and Discount codes');
    this.prizeDrawsAccordion     = page.getByText('Prize Draws, Instant Wins and Giveaways');
    this.privacyAccordion        = page.getByText('Privacy and Personal Data');
    this.accountServicesAccordion = page.getByText('Account Services');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/help/, { timeout: 15000 });
    await this.gettingStartedAccordion.waitFor({ state: 'visible', timeout: 10000 });
  }

  async expandSection(section: Locator): Promise<void> {
    await section.click();
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
