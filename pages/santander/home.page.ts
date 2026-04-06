import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly navigationBar: Locator;
  readonly homeNavLink: Locator;
  readonly myOffersNavLink: Locator;
  readonly profileNavLink: Locator;
  readonly helpNavLink: Locator;
  readonly brandSearchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo            = page.locator('header img, a img').first();
    this.navigationBar   = page.locator('nav#footerContainer');
    this.homeNavLink     = page.getByRole('link', { name: /^home$/i }).first();
    this.myOffersNavLink = page.getByRole('link', { name: /my offers/i }).first();
    this.profileNavLink  = page.getByRole('link', { name: /^profile$/i }).first();
    this.helpNavLink     = page.getByRole('link', { name: /^help$/i }).first();
    this.brandSearchInput = page.locator('input[placeholder*="brand" i]');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/home/, { timeout: 20000 });
    await this.page.locator('#main-content').waitFor({ state: 'visible', timeout: 15000 });
  }

  async isNavigationVisible(): Promise<boolean> {
    // Top nav links are visible on desktop; nav#footerContainer is a mobile-only bottom nav
    return this.myOffersNavLink.isVisible();
  }

  async isLogoVisible(): Promise<boolean> {
    return this.logo.isVisible();
  }

  async goToMyOffers(): Promise<void> {
    await this.myOffersNavLink.click();
    await this.page.waitForURL(/\/myRewards/, { timeout: 10000 });
  }

  async goToProfile(): Promise<void> {
    await this.profileNavLink.click();
    await this.page.waitForURL(/\/myProfile/, { timeout: 10000 });
  }

  async goToHelp(): Promise<void> {
    await this.helpNavLink.click();
    await this.page.waitForURL(/\/help/, { timeout: 10000 });
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
