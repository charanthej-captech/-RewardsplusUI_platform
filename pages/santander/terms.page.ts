import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class TermsPage {
  readonly page: Page;
  readonly consentCheckbox: Locator;
  readonly termsCheckbox: Locator;
  readonly ageCheckbox: Locator;
  readonly acceptButton: Locator;
  readonly declineButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // MUI Radio/Checkbox: the clickable target is the span wrapping the SVG icon
    // (hidden input underneath does not fire MUI's state change on .check())
    const radioSpans = page.locator('span[class*="MuiRadio"], span[class*="MuiCheckbox"]');
    this.consentCheckbox = radioSpans.nth(0);
    this.termsCheckbox   = radioSpans.nth(1);
    this.ageCheckbox     = radioSpans.nth(2);
    this.acceptButton  = page.getByRole('button', { name: /accept/i });
    this.declineButton = page.getByRole('button', { name: /decline/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.acceptButton.waitFor({ state: 'visible', timeout: 15000 });
    // Wait for MUI components to fully hydrate before interacting
    await this.page.waitForLoadState('networkidle');
  }

  /** Tick all three consent checkboxes and click Accept */
  async acceptAll(): Promise<void> {
    await this.consentCheckbox.click();
    await this.termsCheckbox.click();
    await this.ageCheckbox.click();
    await this.acceptButton.click();
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
