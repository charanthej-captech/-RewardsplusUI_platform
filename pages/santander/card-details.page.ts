import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class CardDetailsPage {
  readonly page: Page;
  readonly cardholderNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly cvvInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cardholderNameInput = page.locator('#nameOnCard');
    this.cardNumberInput     = page.locator('#cardNumber');
    this.expiryMonthInput    = page.locator('#expirationMonth');
    this.expiryYearInput     = page.locator('#expirationYear');
    this.cvvInput            = page.locator('#cardCvvNumber');
    this.continueButton      = page.getByRole('button', { name: /continue/i });
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/card-details/, { timeout: 15000 });
    await this.cardholderNameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillCardDetails(details: {
    cardholderName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }): Promise<void> {
    await this.cardholderNameInput.fill(details.cardholderName);
    await this.cardNumberInput.fill(details.cardNumber);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
    await this.cvvInput.fill(details.cvv);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Handles the 3DS2 authentication popup after submitting card details.
   * Flow: device fingerprinting (Visa Secure spinner) → challenge form with password.
   * Step 1: waitForEvent detects when the challenge frame navigates to the ACS URL.
   * Step 2: frameLocator (resilient to reloads) fills the password.
   * Step 3: JS click avoids stability timeout when the frame navigates on form submit.
   * Password hint shown in the popup IS the password: "Checkout1!"
   */
  async complete3DS(password: string = 'Checkout1!'): Promise<void> {
    // Wait for the challenge frame to navigate to the ACS challenge URL
    // (fires after device fingerprinting/Visa Secure spinner completes)
    const challengeFrame = await this.page.waitForEvent('framenavigated', {
      predicate: (frame) => frame.url().includes('challenge'),
      timeout: 45000,
    });

    // Use the Frame object directly — fill password then JS-click to avoid
    // stability timeout caused by the frame navigating away on form submit
    await challengeFrame.waitForSelector('#password', { state: 'visible', timeout: 15000 });
    await challengeFrame.fill('#password', password);
    await challengeFrame.evaluate(() => {
      const btn = document.getElementById('txtButton');
      if (btn) (btn as any).click();
    });
  }

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
