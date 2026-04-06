import { test, expect } from '@playwright/test';
import { loadConfig } from '../../config/configLoader';
import { LandingPage } from '../../pages/santander/landing.page';
import { LoginPage } from '../../pages/santander/login.page';
import { HomePage } from '../../pages/santander/home.page';
import { MyOffersPage } from '../../pages/santander/my-offers.page';
import { ProfilePage } from '../../pages/santander/profile.page';
import { HelpPage } from '../../pages/santander/help.page';

// ── Credentials ─────────────────────────────────────────────────────────────
const CREDENTIALS = {
  email: '2703reg@yopmail.com',
  password: 'Test@123',
};

// ── Test Suite ───────────────────────────────────────────────────────────────
test.describe('Santander Boost — Home Page', () => {

  test.beforeEach(async ({ page }) => {
    const config = loadConfig();

    // Clean session for every test
    await page.context().clearCookies();
    await page.evaluate(() => {
      try { localStorage.clear(); } catch (_) {}
      try { sessionStorage.clear(); } catch (_) {}
    });

    await page.goto(config.baseUrl);
    await page.waitForLoadState('domcontentloaded');

    const landing = new LandingPage(page);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await landing.waitForPageReady();
    await landing.goToLogin();
    await loginPage.waitForPageReady();
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    await homePage.waitForPageReady();
  });

  // ── Suite 1: Home Page Elements ───────────────────────────────────────────
  test.describe('Suite 1: Home Page Elements', () => {

    test('TC_009 — Home page navigation bar is visible after login', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page loaded');

      expect(await homePage.isNavigationVisible()).toBe(true);
    });

    test.skip('TC_010 — Home page logo is visible after login', async ({ page }, testInfo) => {
      // TODO: confirm logo selector after inspecting header
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page logo');

      expect(await homePage.isLogoVisible()).toBe(true);
    });

  });

  // ── Suite 2: Navigation ───────────────────────────────────────────────────
  test.describe('Suite 2: Navigation', () => {

    test('TC_011 — User can navigate to My Offers page', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const myOffersPage = new MyOffersPage(page);

      await homePage.waitForPageReady();
      await homePage.goToMyOffers();

      await myOffersPage.waitForPageReady();
      await myOffersPage.attachScreenshot(testInfo, 'My Offers page');

      expect(page.url()).toMatch(/\/myRewards/);
    });

    test('TC_012 — My Offers page has Favourites and Activated tabs', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const myOffersPage = new MyOffersPage(page);

      await homePage.waitForPageReady();
      await homePage.goToMyOffers();

      await myOffersPage.waitForPageReady();
      await myOffersPage.attachScreenshot(testInfo, 'My Offers tabs');

      expect(await myOffersPage.favouritesTab.isVisible()).toBe(true);
      expect(await myOffersPage.activatedTab.isVisible()).toBe(true);
    });

    test('TC_013 — User can navigate to Profile page', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.attachScreenshot(testInfo, 'Profile page');

      expect(page.url()).toMatch(/\/myProfile/);
    });

    test('TC_014 — Profile page shows settings options', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.attachScreenshot(testInfo, 'Profile settings');

      expect(await profilePage.updateInterestsLink.isVisible()).toBe(true);
      expect(await profilePage.manageSantanderCardLink.isVisible()).toBe(true);
      expect(await profilePage.logOffButton.isVisible()).toBe(true);
    });

    test('TC_015 — User can navigate to Help page', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const helpPage = new HelpPage(page);

      await homePage.waitForPageReady();
      await homePage.goToHelp();

      await helpPage.waitForPageReady();
      await helpPage.attachScreenshot(testInfo, 'Help page');

      expect(page.url()).toMatch(/\/help/);
    });

    test('TC_016 — Help page shows all accordion sections', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const helpPage = new HelpPage(page);

      await homePage.waitForPageReady();
      await homePage.goToHelp();

      await helpPage.waitForPageReady();
      await helpPage.attachScreenshot(testInfo, 'Help accordion sections');

      expect(await helpPage.gettingStartedAccordion.isVisible()).toBe(true);
      expect(await helpPage.cashbackAccordion.isVisible()).toBe(true);
      expect(await helpPage.accountServicesAccordion.isVisible()).toBe(true);
    });

    test.skip('TC_017 — User can log off from Profile page', async ({ page }, testInfo) => {
      // TODO: confirm log off redirect URL before enabling
      const homePage = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.logOff();
      await profilePage.attachScreenshot(testInfo, 'After log off');

      expect(page.url()).toMatch(/\/landing/);
    });

  });

});
