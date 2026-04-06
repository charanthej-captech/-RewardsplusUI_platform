import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly emailError: Locator;

  constructor(page: Page) {
    this.page = page;
    // Email input has no id — scoped via its MUI form control's aria-describedby
    this.emailInput       = page.locator('[aria-describedby="email"] input[type="text"]');
    this.passwordInput    = page.locator('#password');
    this.signInButton     = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.getByText('Forgotten password');
    // Toast banner that appears at bottom on failed login attempt
    this.emailError       = page.locator('[role="alert"]').filter({ hasText: /invalid|incorrect|try again/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/sign-in/, { timeout: 15000 });
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.emailError.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.emailError.textContent()) ?? '';
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
