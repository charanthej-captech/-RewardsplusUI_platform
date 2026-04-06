import { type Locator, type Page } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // TODO: confirm selectors after inspecting the landing page
    this.loginButton = page.getByRole('link', { name: /log on now/i });
    this.signUpButton = page.getByRole('button', { name: /join now/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goToLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async goToSignUp(): Promise<void> {
    await this.signUpButton.click();
  }
}
