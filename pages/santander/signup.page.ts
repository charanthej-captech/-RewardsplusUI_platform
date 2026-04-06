import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;
  readonly titleDropdown: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly townCityInput: Locator;
  readonly postcodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleDropdown   = page.locator('#personTitle');
    this.firstNameInput  = page.locator('#firstName');
    this.lastNameInput   = page.locator('#lastName');
    this.addressLine1Input = page.locator('#addressLineOne');
    this.addressLine2Input = page.locator('#addressLineTwo');
    this.townCityInput   = page.locator('#city');
    this.postcodeInput   = page.locator('#postCode');
    this.continueButton  = page.locator('#btn_nxt');
    this.errorMessage    = page.locator('[role="alert"]').first();
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/customer-details/, { timeout: 15000 });
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectTitle(title: string): Promise<void> {
    await this.titleDropdown.click();
    await this.page.locator(`li[role="option"][data-value="${title}"]`).click();
  }

  async fillCustomerDetails(details: {
    title: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    townCity: string;
    postcode: string;
  }): Promise<void> {
    await this.selectTitle(details.title);
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.addressLine1Input.fill(details.addressLine1);
    if (details.addressLine2) {
      await this.addressLine2Input.fill(details.addressLine2);
    }
    await this.townCityInput.fill(details.townCity);
    await this.postcodeInput.fill(details.postcode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.errorMessage.textContent()) ?? '';
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
