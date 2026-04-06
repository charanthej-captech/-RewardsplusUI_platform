import { test, expect } from '@playwright/test';
import { loadConfig } from '../../config/configLoader';
import { LandingPage } from '../../pages/santander/landing.page';
import { LoginPage } from '../../pages/santander/login.page';
import { TermsPage } from '../../pages/santander/terms.page';
import { SignUpPage } from '../../pages/santander/signup.page';
import { RegistrationPage } from '../../pages/santander/registration.page';
import { InterestPage } from '../../pages/santander/interest.page';
import { CardDetailsPage } from '../../pages/santander/card-details.page';
import { HomePage } from '../../pages/santander/home.page';

// ── Credentials ──────────────────────────────────────────────────────────────
// Fallback: known existing account used when TC_004 runs in isolation.
// TC_002 overwrites both fields after creating a fresh account, so the full
// suite always logs in with the account it just registered.
const CREDENTIALS = {
  email: '2703reg@yopmail.com',
  password: 'Test@123',
};

// ── Card test data ───────────────────────────────────────────────────────────
const CARD_DATA = {
  cardholderName: 'Charan Thej',
  cardNumber: '4242424242424242',
  expiryMonth: '12',
  expiryYear: '30',
  cvv: '123',
};

// ── Signup test data ─────────────────────────────────────────────────────────
const SIGNUP_DATA = {
  title: 'Mr',
  firstName: 'Test',
  lastName: 'User',
  addressLine1: '123 Test Street',
  addressLine2: '',
  townCity: 'London',
  postcode: 'SW1A 1AA',
};

// ── Test Suite ───────────────────────────────────────────────────────────────
test.describe('Santander Boost — Auth', () => {

  test.beforeEach(async ({ page }) => {
    const config = loadConfig();
    // Clear cookies/storage to ensure a clean unauthenticated state for every test
    await page.context().clearCookies();
    await page.evaluate(() => {
      try { localStorage.clear(); } catch (_) {}
      try { sessionStorage.clear(); } catch (_) {}
    });
    await page.goto(config.baseUrl);
    await page.waitForLoadState('domcontentloaded');
  });

  // ── Suite 1: Sign Up ──────────────────────────────────────────────────────
  test.describe('Suite 1: Sign Up', () => {

    test('TC_001 — User can navigate to customer details via Terms page', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const termsPage = new TermsPage(page);
      const signUpPage = new SignUpPage(page);

      await landing.waitForPageReady();
      await landing.goToSignUp();

      await termsPage.waitForPageReady();
      await termsPage.attachScreenshot(testInfo, 'Terms page loaded');

      await termsPage.acceptAll();

      await signUpPage.waitForPageReady();
      await signUpPage.attachScreenshot(testInfo, 'Customer details page loaded');

      expect(page.url()).toMatch(/\/customer-details/);
    });

    test('TC_002 — User can complete full registration flow', async ({ page }, testInfo) => {
      test.setTimeout(120000);
      const landing = new LandingPage(page);
      const termsPage = new TermsPage(page);
      const signUpPage = new SignUpPage(page);
      const registrationPage = new RegistrationPage(page);
      const interestPage = new InterestPage(page);
      const cardDetailsPage = new CardDetailsPage(page);

      await landing.waitForPageReady();
      await landing.goToSignUp();

      await termsPage.waitForPageReady();
      await termsPage.acceptAll();

      await signUpPage.waitForPageReady();
      await signUpPage.fillCustomerDetails(SIGNUP_DATA);
      await signUpPage.attachScreenshot(testInfo, 'Customer details filled');
      await signUpPage.continue();

      await registrationPage.waitForPageReady();
      await registrationPage.attachScreenshot(testInfo, 'Registration page loaded');
      CREDENTIALS.email    = `testuser_${Date.now()}@yopmail.com`;
      CREDENTIALS.password = 'Test@1234';
      await registrationPage.register(
        CREDENTIALS.email,
        CREDENTIALS.password,
      );

      await interestPage.waitForPageReady();
      await interestPage.attachScreenshot(testInfo, 'Interest page loaded');
      await interestPage.selectInterests(['Food and Dining', 'Travel']);
      await interestPage.continue();

      await cardDetailsPage.waitForPageReady();
      await cardDetailsPage.attachScreenshot(testInfo, 'Card details page loaded');
      await cardDetailsPage.fillCardDetails(CARD_DATA);
      await cardDetailsPage.attachScreenshot(testInfo, 'Card details filled');
      await cardDetailsPage.continue();

      await cardDetailsPage.complete3DS();

      const homePage = new HomePage(page);
      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page after registration');
      expect(page.url()).toMatch(/\/home/);
    });

    test('TC_003 — Signup fails with missing required fields on customer details', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const termsPage = new TermsPage(page);
      const signUpPage = new SignUpPage(page);

      await landing.waitForPageReady();
      await landing.goToSignUp();

      await termsPage.waitForPageReady();
      await termsPage.acceptAll();

      await signUpPage.waitForPageReady();
      await signUpPage.attachScreenshot(testInfo, 'Customer details empty form');

      // The Continue button is disabled when required fields are empty
      expect(await signUpPage.continueButton.isDisabled()).toBe(true);
    });

  });

  // ── Suite 2: Login ────────────────────────────────────────────────────────
  test.describe('Suite 2: Login', () => {

    test('TC_004 — User can log in with valid credentials', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);

      await landing.waitForPageReady();
      await landing.goToLogin();

      await loginPage.waitForPageReady();
      await loginPage.attachScreenshot(testInfo, 'Login page loaded');

      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
      await loginPage.attachScreenshot(testInfo, 'After login submitted');

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page after login');

      expect(page.url()).toMatch(/\/home/);
    });

    test('TC_005 — Login fails with invalid password', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const loginPage = new LoginPage(page);

      await landing.waitForPageReady();
      await landing.goToLogin();

      await loginPage.waitForPageReady();
      await loginPage.login(CREDENTIALS.email, 'WrongPassword123');
      await loginPage.attachScreenshot(testInfo, 'After invalid login attempt');

      const error = await loginPage.getErrorMessage();
      expect(error.length).toBeGreaterThan(0);
    });

    test('TC_006 — Login fails with empty email', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const loginPage = new LoginPage(page);

      await landing.waitForPageReady();
      await landing.goToLogin();

      await loginPage.waitForPageReady();
      await loginPage.emailInput.fill('');
      await loginPage.passwordInput.fill(CREDENTIALS.password);
      await loginPage.attachScreenshot(testInfo, 'Sign In button disabled with empty email');

      expect(await loginPage.signInButton.isDisabled()).toBe(true);
    });

    test('TC_007 — Login fails with empty password', async ({ page }, testInfo) => {
      const landing = new LandingPage(page);
      const loginPage = new LoginPage(page);

      await landing.waitForPageReady();
      await landing.goToLogin();

      await loginPage.waitForPageReady();
      await loginPage.emailInput.fill(CREDENTIALS.email);
      await loginPage.passwordInput.fill('');
      await loginPage.attachScreenshot(testInfo, 'Sign In button disabled with empty password');

      expect(await loginPage.signInButton.isDisabled()).toBe(true);
    });

  });

});
