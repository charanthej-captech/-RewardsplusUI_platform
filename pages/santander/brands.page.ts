import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class BrandsPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly brandRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'View all brands' });
    this.searchInput = page.locator('#custom-autocomplete');
    // Brands page uses inline list filtering — no popup dropdown
    this.brandRows   = page.locator('[role="link"][id^="row-"]');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/brands/, { timeout: 15000 });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for at least one brand row to render
    await this.brandRows.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async searchBrand(brandName: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(brandName);
    // Brands page filters the list inline — wait for list to update
    await this.page.waitForTimeout(800);
  }

  async getBrandCount(): Promise<number> {
    return this.brandRows.count();
  }

  async clickBrandByName(brandName: string): Promise<void> {
    await this.page.locator(`a[aria-label="link for ${brandName}"]`).click();
    await this.page.waitForURL(/\/brand\//, { timeout: 10000 });
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
