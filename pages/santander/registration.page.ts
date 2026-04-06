import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly joinNowButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly repeatPasswordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput          = page.locator('#email');
    this.passwordInput       = page.locator('#password');
    this.repeatPasswordInput = page.locator('#repeat-password');
    this.joinNowButton       = page.locator('button[type="submit"]');
    this.emailError          = page.locator('#zipError');
    this.passwordError       = page.locator('#passwordError');
    this.repeatPasswordError = page.locator('#repeat-passwordError');
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/registration/, { timeout: 15000 });
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async register(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.repeatPasswordInput.fill(password);
    await this.joinNowButton.click();
  }

  async getEmailError(): Promise<string> {
    await this.emailError.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.emailError.textContent()) ?? '';
  }

  async getPasswordError(): Promise<string> {
    await this.passwordError.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.passwordError.textContent()) ?? '';
  }

  async getRepeatPasswordError(): Promise<string> {
    await this.repeatPasswordError.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.repeatPasswordError.textContent()) ?? '';
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
