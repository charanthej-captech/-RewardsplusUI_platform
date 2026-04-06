import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly navigationBar: Locator;
  readonly confirmedCashback: Locator;
  readonly cashbackEarnedToDate: Locator;
  readonly updateInterestsLink: Locator;
  readonly manageSantanderCardLink: Locator;
  readonly changeEmailLink: Locator;
  readonly changePasswordLink: Locator;
  readonly logOffButton: Locator;
  readonly optOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationBar           = page.locator('nav#footerContainer');
    this.confirmedCashback       = page.getByText('Confirmed cashback').locator('..').getByText(/£/);
    this.cashbackEarnedToDate    = page.getByText('Cashback earned to date').locator('..').getByText(/£/);
    this.updateInterestsLink     = page.getByText('Update my interests');
    this.manageSantanderCardLink = page.getByText('Manage my Santander card');
    this.changeEmailLink         = page.getByText('Change my email');
    this.changePasswordLink      = page.getByText('Change my password');
    this.logOffButton            = page.getByText('Log off');
    this.optOutButton            = page.getByText('Opt-out of Boosts');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/myProfile/, { timeout: 15000 });
    await this.logOffButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async logOff(): Promise<void> {
    await this.logOffButton.click();
    await this.page.waitForURL(/\/landing/, { timeout: 10000 });
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
